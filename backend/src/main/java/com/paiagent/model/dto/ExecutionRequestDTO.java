package com.paiagent.model.dto;

import lombok.Data;

@Data
public class ExecutionRequestDTO {
    private String workflowId;
    private String inputText;
}
