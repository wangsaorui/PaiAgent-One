package com.paiagent.engine.executors;

import com.paiagent.engine.ExecutionContext;
import com.paiagent.engine.NodeExecutor;
import com.paiagent.engine.NodeResult;
import com.paiagent.model.workflow.NodeDefinition;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class UserInputNodeExecutor implements NodeExecutor {

    @Override
    public boolean supports(String nodeType) {
        return "user-input".equals(nodeType);
    }

    @Override
    public NodeResult execute(NodeDefinition node, ExecutionContext context) {
        String inputText = context.getInputText();
        log.info("UserInput node [{}]: received input text ({} chars)", node.getId(), inputText.length());
        return NodeResult.success(node.getId(), node.getType(), inputText);
    }
}
