package com.paiagent.controller;

import com.paiagent.engine.ExecutionEventEmitter;
import com.paiagent.engine.WorkflowEngineService;
import com.paiagent.model.dto.ExecutionRequestDTO;
import com.paiagent.model.entity.ExecutionRecord;
import com.paiagent.model.workflow.WorkflowDefinition;
import com.paiagent.repository.ExecutionRecordRepository;
import com.paiagent.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/executions")
@RequiredArgsConstructor
public class ExecutionController {

    private final WorkflowService workflowService;
    private final WorkflowEngineService engineService;
    private final ExecutionEventEmitter eventEmitter;
    private final ExecutionRecordRepository executionRecordRepository;

    @PostMapping
    public ResponseEntity<Map<String, String>> startExecution(@RequestBody ExecutionRequestDTO request) {
        String executionId = UUID.randomUUID().toString();

        // Create execution record
        ExecutionRecord record = new ExecutionRecord();
        record.setId(executionId);
        record.setWorkflowId(request.getWorkflowId());
        record.setStatus("PENDING");
        record.setInputText(request.getInputText());
        executionRecordRepository.save(record);

        // Parse workflow definition and start async execution
        WorkflowDefinition definition = workflowService.parseDefinition(request.getWorkflowId());
        engineService.executeWorkflow(executionId, definition, request.getInputText());

        return ResponseEntity.ok(Map.of(
                "executionId", executionId,
                "status", "PENDING"
        ));
    }

    @GetMapping(value = "/{id}/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamEvents(@PathVariable String id) {
        SseEmitter emitter = new SseEmitter(300_000L); // 5 minutes timeout
        eventEmitter.register(id, emitter);
        return emitter;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExecutionRecord> getExecution(@PathVariable String id) {
        return executionRecordRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
