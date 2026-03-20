package com.paiagent.engine;

import lombok.Data;

@Data
public class NodeResult {
    private String nodeId;
    private String nodeType;
    private boolean success;
    private Object output;
    private String error;

    public static NodeResult success(String nodeId, String nodeType, Object output) {
        NodeResult result = new NodeResult();
        result.setNodeId(nodeId);
        result.setNodeType(nodeType);
        result.setSuccess(true);
        result.setOutput(output);
        return result;
    }

    public static NodeResult failure(String nodeId, String nodeType, String error) {
        NodeResult result = new NodeResult();
        result.setNodeId(nodeId);
        result.setNodeType(nodeType);
        result.setSuccess(false);
        result.setError(error);
        return result;
    }
}
