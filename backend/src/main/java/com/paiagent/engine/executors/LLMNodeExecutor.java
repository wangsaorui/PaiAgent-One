package com.paiagent.engine.executors;

import com.paiagent.engine.ExecutionContext;
import com.paiagent.engine.NodeExecutor;
import com.paiagent.engine.NodeResult;
import com.paiagent.model.workflow.NodeDefinition;
import com.paiagent.service.LLMService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class LLMNodeExecutor implements NodeExecutor {

    private final LLMService llmService;

    @Override
    public boolean supports(String nodeType) {
        return "llm-node".equals(nodeType);
    }

    @Override
    public NodeResult execute(NodeDefinition node, ExecutionContext context) {
        Map<String, Object> config = node.getConfig();
        String provider = (String) config.getOrDefault("provider", "openai");
        String model = (String) config.getOrDefault("model", "");
        String systemPrompt = (String) config.getOrDefault("systemPrompt", "You are a helpful assistant.");
        double temperature = config.containsKey("temperature")
                ? ((Number) config.get("temperature")).doubleValue()
                : 0.7;

        String userMessage = context.getLastOutput();
        if (userMessage == null || userMessage.isBlank()) {
            userMessage = context.getInputText();
        }

        log.info("LLM node [{}]: calling provider={}, model={}", node.getId(), provider, model);

        try {
            String response = llmService.chat(provider, model, systemPrompt, userMessage, temperature);
            log.info("LLM node [{}]: got response ({} chars)", node.getId(), response.length());
            return NodeResult.success(node.getId(), node.getType(), response);
        } catch (Exception e) {
            log.error("LLM node [{}] failed: {}", node.getId(), e.getMessage());
            return NodeResult.failure(node.getId(), node.getType(), e.getMessage());
        }
    }
}
