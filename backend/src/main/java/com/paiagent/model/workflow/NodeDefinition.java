package com.paiagent.model.workflow;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NodeDefinition {
    private String id;
    private String type;
    private Position position;
    private String label;
    private Map<String, Object> config = new HashMap<>();
    private NodeData data;

    @Data
    public static class Position {
        private double x;
        private double y;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class NodeData {
        private String label;
        private String nodeType;
        private Map<String, Object> config = new HashMap<>();
    }

    /**
     * Returns the effective config: prefers data.config if present, falls back to top-level config.
     */
    public Map<String, Object> getEffectiveConfig() {
        if (data != null && data.getConfig() != null && !data.getConfig().isEmpty()) {
            return data.getConfig();
        }
        return config;
    }
}
