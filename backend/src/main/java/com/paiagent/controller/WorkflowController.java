package com.paiagent.controller;

import com.paiagent.model.dto.WorkflowDTO;
import com.paiagent.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;

    @GetMapping
    public ResponseEntity<List<WorkflowDTO>> listWorkflows() {
        return ResponseEntity.ok(workflowService.listWorkflows());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkflowDTO> getWorkflow(@PathVariable String id) {
        return ResponseEntity.ok(workflowService.getWorkflow(id));
    }

    @PostMapping
    public ResponseEntity<WorkflowDTO> createWorkflow(@RequestBody WorkflowDTO dto) {
        return ResponseEntity.ok(workflowService.createWorkflow(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkflowDTO> updateWorkflow(@PathVariable String id, @RequestBody WorkflowDTO dto) {
        return ResponseEntity.ok(workflowService.updateWorkflow(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable String id) {
        workflowService.deleteWorkflow(id);
        return ResponseEntity.noContent().build();
    }
}
