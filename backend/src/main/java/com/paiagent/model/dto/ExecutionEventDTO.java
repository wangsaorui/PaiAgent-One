package com.paiagent.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionEventDTO {
    private String type;
    private String nodeId;
    private String nodeType;
    private String status;
    private Object output;
    private String error;
    private String message;
    private long timestamp;
}
