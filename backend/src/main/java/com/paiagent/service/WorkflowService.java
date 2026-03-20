package com.paiagent.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.paiagent.model.dto.WorkflowDTO;
import com.paiagent.model.entity.Workflow;
import com.paiagent.model.workflow.WorkflowDefinition;
import com.paiagent.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final ObjectMapper objectMapper;

    public List<WorkflowDTO> listWorkflows() {
        return workflowRepository.findAllByOrderByUpdatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public WorkflowDTO getWorkflow(String id) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found: " + id));
        return toDTO(workflow);
    }

    public WorkflowDTO createWorkflow(WorkflowDTO dto) {
        Workflow workflow = new Workflow();
        workflow.setId(UUID.randomUUID().toString());
        workflow.setName(dto.getName());
        workflow.setDefinition(serializeDefinition(dto.getDefinition()));
        workflowRepository.save(workflow);
        return toDTO(workflow);
    }

    public WorkflowDTO updateWorkflow(String id, WorkflowDTO dto) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found: " + id));
        workflow.setName(dto.getName());
        workflow.setDefinition(serializeDefinition(dto.getDefinition()));
        workflowRepository.save(workflow);
        return toDTO(workflow);
    }

    public void deleteWorkflow(String id) {
        workflowRepository.deleteById(id);
    }

    public WorkflowDefinition parseDefinition(String id) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found: " + id));
        try {
            return objectMapper.readValue(workflow.getDefinition(), WorkflowDefinition.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse workflow definition", e);
        }
    }

    private WorkflowDTO toDTO(Workflow workflow) {
        WorkflowDTO dto = new WorkflowDTO();
        dto.setId(workflow.getId());
        dto.setName(workflow.getName());
        try {
            dto.setDefinition(objectMapper.readTree(workflow.getDefinition()));
        } catch (JsonProcessingException e) {
            dto.setDefinition(workflow.getDefinition());
        }
        if (workflow.getCreatedAt() != null) {
            dto.setCreatedAt(workflow.getCreatedAt().toString());
        }
        if (workflow.getUpdatedAt() != null) {
            dto.setUpdatedAt(workflow.getUpdatedAt().toString());
        }
        return dto;
    }

    private String serializeDefinition(Object definition) {
        try {
            if (definition instanceof String) {
                return (String) definition;
            }
            return objectMapper.writeValueAsString(definition);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize workflow definition", e);
        }
    }
}
