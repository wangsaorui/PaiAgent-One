package com.paiagent.model.workflow;

import lombok.Data;

import java.util.List;

@Data
public class WorkflowDefinition {
    private String id;
    private String name;
    private List<NodeDefinition> nodes;
    private List<EdgeDefinition> edges;
}
