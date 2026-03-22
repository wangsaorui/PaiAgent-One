package com.paiagent.engine.executors;

import com.paiagent.engine.ExecutionContext;
import com.paiagent.engine.NodeExecutor;
import com.paiagent.engine.NodeResult;
import com.paiagent.model.workflow.NodeDefinition;
import com.paiagent.service.LLMService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
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
    @SuppressWarnings("unchecked")
    public NodeResult execute(NodeDefinition node, ExecutionContext context) {
        Map<String, Object> config = node.getEffectiveConfig();
        String provider = (String) config.getOrDefault("provider", "openai");
        String model = (String) config.getOrDefault("model", "");
        String systemPrompt = (String) config.getOrDefault("systemPrompt", "You are a helpful assistant.");
        double temperature = config.containsKey("temperature")
                ? ((Number) config.get("temperature")).doubleValue()
                : 0.7;
        String apiKey = (String) config.getOrDefault("apiKey", "");
        String baseUrl = (String) config.getOrDefault("baseUrl", "");

        // 优先从 inputParams 中解析用户消息
        String userMessage = resolveInputParams(config, context);

        // 若没有配置 inputParams，则降级到原有逻辑
        if (userMessage == null || userMessage.isBlank()) {
            userMessage = context.getLastOutput();
        }
        if (userMessage == null || userMessage.isBlank()) {
            userMessage = context.getInputText();
        }

        log.info("LLM node [{}]: calling provider={}, model={}", node.getId(), provider, model);

        try {
            String response = llmService.chat(provider, model, systemPrompt, userMessage, temperature, apiKey, baseUrl);
            log.info("LLM node [{}]: got response ({} chars)", node.getId(), response.length());
            return NodeResult.success(node.getId(), node.getType(), response);
        } catch (Exception e) {
            log.error("LLM node [{}] failed: {}", node.getId(), e.getMessage());
            return NodeResult.failure(node.getId(), node.getType(), e.getMessage());
        }
    }

    /**
     * 从 config.inputParams 中解析用户消息。
     * 若有多个参数，拼接为 key=value 格式传入。
     */
    @SuppressWarnings("unchecked")
    private String resolveInputParams(Map<String, Object> config, ExecutionContext context) {
        Object raw = config.get("inputParams");
        if (!(raw instanceof List)) {
            return null;
        }
        List<Map<String, Object>> params = (List<Map<String, Object>>) raw;
        if (params.isEmpty()) {
            return null;
        }

        StringBuilder sb = new StringBuilder();
        for (Map<String, Object> param : params) {
            String type = (String) param.getOrDefault("type", "input");
            String name = (String) param.getOrDefault("name", "");
            String value;

            if ("reference".equals(type)) {
                String refNodeId = (String) param.get("referenceNodeId");
                String refOutputKey = (String) param.getOrDefault("referenceOutputKey", "");
                value = resolveReference(refNodeId, refOutputKey, context);
            } else {
                value = (String) param.getOrDefault("value", "");
            }

            if (value != null && !value.isBlank()) {
                if (sb.length() > 0) sb.append("\n");
                if (params.size() > 1) {
                    sb.append(name).append(": ").append(value);
                } else {
                    sb.append(value);
                }
            }
        }

        return sb.length() > 0 ? sb.toString() : null;
    }

    private String resolveReference(String nodeId, String outputKey, ExecutionContext context) {
        if (nodeId == null || nodeId.isBlank()) return null;
        Object output = context.getNodeOutput(nodeId);
        if (output instanceof Map) {
            Object val = ((Map<?, ?>) output).get(outputKey);
            return val != null ? val.toString() : null;
        }
        if (output instanceof String) {
            return (String) output;
        }
        // 尝试从全局输入文本中解析（user-input 节点的输出直接是输入文本）
        if (output == null) {
            // user-input 节点在 UserInputNodeExecutor 中将输入保存为 "user_input" 键
            return context.getInputText();
        }
        return output.toString();
    }
}
