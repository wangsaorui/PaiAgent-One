package com.paiagent.engine;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class ExecutionContext {
    private String executionId;
    private String inputText;
    private Map<String, Object> nodeOutputs = new HashMap<>();
    private String lastOutput;

    public void setNodeOutput(String nodeId, Object output) {
        nodeOutputs.put(nodeId, output);
        if (output instanceof String) {
            lastOutput = (String) output;
        }
    }

    public Object getNodeOutput(String nodeId) {
        return nodeOutputs.get(nodeId);
    }
}
