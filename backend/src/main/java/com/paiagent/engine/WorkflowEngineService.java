package com.paiagent.engine;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paiagent.model.dto.ExecutionEventDTO;
import com.paiagent.model.entity.ExecutionRecord;
import com.paiagent.model.workflow.EdgeDefinition;
import com.paiagent.model.workflow.NodeDefinition;
import com.paiagent.model.workflow.WorkflowDefinition;
import com.paiagent.repository.ExecutionRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowEngineService {

    private final List<NodeExecutor> nodeExecutors;
    private final ExecutionEventEmitter eventEmitter;
    private final ExecutionRecordRepository executionRecordRepository;
    private final ObjectMapper objectMapper;

    @Async("workflowExecutor")
    public void executeWorkflow(String executionId, WorkflowDefinition definition, String inputText) {
        // Wait for SSE connection to be established
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        ExecutionContext context = new ExecutionContext();
        context.setExecutionId(executionId);
        context.setInputText(inputText);

        log.info("Starting workflow execution: {}", executionId);

        try {
            List<NodeDefinition> sortedNodes = topologicalSort(definition);
            log.info("Execution order: {}", sortedNodes.stream().map(n -> n.getId() + "(" + n.getType() + ")").toList());

            for (NodeDefinition node : sortedNodes) {
                // Emit NODE_STARTED
                eventEmitter.emit(executionId, ExecutionEventDTO.builder()
                        .type("NODE_STARTED")
                        .nodeId(node.getId())
                        .nodeType(node.getType())
                        .status("running")
                        .timestamp(System.currentTimeMillis())
                        .build());

                // Add small delay to allow frontend to render the started state
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }

                NodeExecutor executor = findExecutor(node.getType());
                
                // Execute node with periodic status updates
                NodeResult result = executeNodeWithProgress(executionId, node, executor, context);

                if (result.isSuccess()) {
                    context.setNodeOutput(node.getId(), result.getOutput());

                    eventEmitter.emit(executionId, ExecutionEventDTO.builder()
                            .type("NODE_COMPLETED")
                            .nodeId(node.getId())
                            .nodeType(node.getType())
                            .status("completed")
                            .output(result.getOutput())
                            .timestamp(System.currentTimeMillis())
                            .build());
                    
                    // Add delay after completion to allow frontend to render
                    try {
                        Thread.sleep(200);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                } else {
                    eventEmitter.emit(executionId, ExecutionEventDTO.builder()
                            .type("NODE_FAILED")
                            .nodeId(node.getId())
                            .nodeType(node.getType())
                            .status("failed")
                            .error(result.getError())
                            .timestamp(System.currentTimeMillis())
                            .build());

                    // Update record as failed
                    updateExecutionRecord(executionId, "FAILED", null, context);

                    eventEmitter.emit(executionId, ExecutionEventDTO.builder()
                            .type("EXECUTION_FAILED")
                            .error("Node " + node.getId() + " failed: " + result.getError())
                            .timestamp(System.currentTimeMillis())
                            .build());

                    eventEmitter.complete(executionId);
                    return;
                }
            }

            // Find audio URL from context (from TTS node output)
            String audioUrl = findAudioUrl(context);

            // Update record as completed
            updateExecutionRecord(executionId, "COMPLETED", audioUrl, context);

            eventEmitter.emit(executionId, ExecutionEventDTO.builder()
                    .type("EXECUTION_COMPLETED")
                    .status("completed")
                    .output(audioUrl)
                    .timestamp(System.currentTimeMillis())
                    .build());

        } catch (Exception e) {
            log.error("Workflow execution failed: {}", e.getMessage(), e);
            updateExecutionRecord(executionId, "FAILED", null, context);

            eventEmitter.emit(executionId, ExecutionEventDTO.builder()
                    .type("EXECUTION_FAILED")
                    .error(e.getMessage())
                    .timestamp(System.currentTimeMillis())
                    .build());
        } finally {
            eventEmitter.complete(executionId);
        }
    }

    private List<NodeDefinition> topologicalSort(WorkflowDefinition definition) {
        Map<String, NodeDefinition> nodeMap = new HashMap<>();
        Map<String, List<String>> adjacency = new HashMap<>();
        Map<String, Integer> inDegree = new HashMap<>();

        for (NodeDefinition node : definition.getNodes()) {
            nodeMap.put(node.getId(), node);
            adjacency.put(node.getId(), new ArrayList<>());
            inDegree.put(node.getId(), 0);
        }

        for (EdgeDefinition edge : definition.getEdges()) {
            adjacency.get(edge.getSource()).add(edge.getTarget());
            inDegree.merge(edge.getTarget(), 1, Integer::sum);
        }

        Queue<String> queue = new LinkedList<>();
        for (Map.Entry<String, Integer> entry : inDegree.entrySet()) {
            if (entry.getValue() == 0) {
                queue.offer(entry.getKey());
            }
        }

        List<NodeDefinition> sorted = new ArrayList<>();
        while (!queue.isEmpty()) {
            String nodeId = queue.poll();
            sorted.add(nodeMap.get(nodeId));
            for (String neighbor : adjacency.get(nodeId)) {
                inDegree.merge(neighbor, -1, Integer::sum);
                if (inDegree.get(neighbor) == 0) {
                    queue.offer(neighbor);
                }
            }
        }

        if (sorted.size() != definition.getNodes().size()) {
            throw new RuntimeException("Workflow contains cycles");
        }

        return sorted;
    }

    private NodeExecutor findExecutor(String nodeType) {
        if (nodeType == null || nodeType.isBlank()) {
            throw new RuntimeException("Node type is empty or null. Please check if the workflow was saved correctly.");
        }
        return nodeExecutors.stream()
                .filter(e -> e.supports(nodeType))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No executor found for node type: " + nodeType));
    }

    /**
     * Execute node with periodic progress updates
     */
    private NodeResult executeNodeWithProgress(String executionId, NodeDefinition node, 
                                             NodeExecutor executor, ExecutionContext context) {
        // For LLM nodes, simulate progress updates
        if ("llm-node".equals(node.getType())) {
            return executeLLMNodeWithProgress(executionId, node, executor, context);
        }
        
        // For other nodes, execute normally
        return executor.execute(node, context);
    }

    /**
     * Execute LLM node with simulated progress updates
     */
    private NodeResult executeLLMNodeWithProgress(String executionId, NodeDefinition node,
                                                NodeExecutor executor, ExecutionContext context) {
        // Start a background thread to send progress updates
        final boolean[] completed = {false};
        final NodeResult[] result = {null};
        
        Thread progressThread = new Thread(() -> {
            int progress = 0;
            while (!completed[0] && progress < 100) {
                try {
                    Thread.sleep(300); // Update every 300ms
                    progress = Math.min(progress + 10, 90); // Cap at 90% until completion
                    
                    eventEmitter.emit(executionId, ExecutionEventDTO.builder()
                            .type("NODE_PROGRESS")
                            .nodeId(node.getId())
                            .nodeType(node.getType())
                            .status("running")
                            .message("Processing... " + progress + "%")
                            .timestamp(System.currentTimeMillis())
                            .build());
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
        progressThread.setDaemon(true);
        progressThread.start();
        
        // Execute the actual node
        try {
            result[0] = executor.execute(node, context);
            completed[0] = true;
            
            // Send final 100% progress
            eventEmitter.emit(executionId, ExecutionEventDTO.builder()
                    .type("NODE_PROGRESS")
                    .nodeId(node.getId())
                    .nodeType(node.getType())
                    .status("running")
                    .message("Processing... 100%")
                    .timestamp(System.currentTimeMillis())
                    .build());
            
            return result[0];
        } finally {
            completed[0] = true;
            try {
                progressThread.join(1000); // Wait up to 1 second for progress thread to finish
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    private String findAudioUrl(ExecutionContext context) {
        for (Object output : context.getNodeOutputs().values()) {
            if (output instanceof String str && str.contains("/audio/")) {
                return str;
            }
        }
        return null;
    }

    private void updateExecutionRecord(String executionId, String status, String audioUrl, ExecutionContext context) {
        try {
            executionRecordRepository.findById(executionId).ifPresent(record -> {
                record.setStatus(status);
                record.setResultAudioUrl(audioUrl);
                try {
                    record.setNodeResults(objectMapper.writeValueAsString(context.getNodeOutputs()));
                } catch (Exception e) {
                    log.warn("Failed to serialize node results", e);
                }
                executionRecordRepository.save(record);
            });
        } catch (Exception e) {
            log.error("Failed to update execution record: {}", e.getMessage());
        }
    }
}
