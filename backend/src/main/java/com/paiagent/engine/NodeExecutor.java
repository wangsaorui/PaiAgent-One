package com.paiagent.engine;

import com.paiagent.model.workflow.NodeDefinition;

public interface NodeExecutor {
    boolean supports(String nodeType);
    NodeResult execute(NodeDefinition node, ExecutionContext context);
}
