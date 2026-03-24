package com.paiagent.engine.executors;

import com.paiagent.engine.ExecutionContext;
import com.paiagent.engine.NodeExecutor;
import com.paiagent.engine.NodeResult;
import com.paiagent.model.workflow.NodeDefinition;
import com.paiagent.service.TTSService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class TTSNodeExecutor implements NodeExecutor {

    private final TTSService ttsService;

    @Override
    public boolean supports(String nodeType) {
        return "tts-node".equals(nodeType);
    }

    @Override
    @SuppressWarnings("unchecked")
    public NodeResult execute(NodeDefinition node, ExecutionContext context) {
        Map<String, Object> config = node.getEffectiveConfig();

        // 获取 text 参数
        String textToSynthesize = resolveTextParam(config, context);
        if (textToSynthesize == null || textToSynthesize.isBlank()) {
            return NodeResult.failure(node.getId(), node.getType(), "No text input for TTS synthesis");
        }

        log.info("TTS node [{}]: synthesizing {} chars of text", node.getId(), textToSynthesize.length());

        try {
            String audioUrl = ttsService.synthesize(textToSynthesize, config);
            log.info("TTS node [{}]: audio generated at {}", node.getId(), audioUrl);
            return NodeResult.success(node.getId(), node.getType(), audioUrl);
        } catch (Exception e) {
            log.error("TTS node [{}] failed: {}", node.getId(), e.getMessage());
            return NodeResult.failure(node.getId(), node.getType(), e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private String resolveTextParam(Map<String, Object> config, ExecutionContext context) {
        Object textParamObj = config.get("textParam");
        if (!(textParamObj instanceof Map)) {
            // 降级到使用上一个节点的输出
            return context.getLastOutput();
        }

        Map<String, Object> textParam = (Map<String, Object>) textParamObj;
        String type = (String) textParam.getOrDefault("type", "reference");

        if ("input".equals(type)) {
            // 手动输入
            return (String) textParam.getOrDefault("value", "");
        } else {
            // 引用节点输出
            String refNodeId = (String) textParam.get("referenceNodeId");
            if (refNodeId == null || refNodeId.isBlank()) {
                return context.getLastOutput();
            }

            Object output = context.getNodeOutput(refNodeId);
            if (output instanceof String) {
                return (String) output;
            }

            // 如果找不到引用节点的输出，降级到上一个输出
            return context.getLastOutput();
        }
    }
}
