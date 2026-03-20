package com.paiagent.engine.executors;

import com.paiagent.engine.ExecutionContext;
import com.paiagent.engine.NodeExecutor;
import com.paiagent.engine.NodeResult;
import com.paiagent.model.workflow.NodeDefinition;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class EndNodeExecutor implements NodeExecutor {

    @Override
    public boolean supports(String nodeType) {
        return "end-node".equals(nodeType);
    }

    @Override
    public NodeResult execute(NodeDefinition node, ExecutionContext context) {
        log.info("End node [{}]: workflow execution finished", node.getId());
        return NodeResult.success(node.getId(), node.getType(), context.getLastOutput());
    }
}
