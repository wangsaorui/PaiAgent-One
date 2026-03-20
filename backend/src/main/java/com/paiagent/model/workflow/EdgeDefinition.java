package com.paiagent.model.workflow;

import lombok.Data;

@Data
public class EdgeDefinition {
    private String id;
    private String source;
    private String sourceHandle;
    private String target;
    private String targetHandle;
}
