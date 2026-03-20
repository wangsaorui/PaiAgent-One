package com.paiagent.model.workflow;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class NodeDefinition {
    private String id;
    private String type;
    private Position position;
    private Map<String, Object> config = new HashMap<>();

    @Data
    public static class Position {
        private double x;
        private double y;
    }
}
