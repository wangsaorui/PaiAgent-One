package com.paiagent.engine.executors;

import com.paiagent.engine.ExecutionContext;
import com.paiagent.engine.NodeExecutor;
import com.paiagent.engine.NodeResult;
import com.paiagent.model.workflow.NodeDefinition;
import com.paiagent.service.TTSService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

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
    public NodeResult execute(NodeDefinition node, ExecutionContext context) {
        String textToSynthesize = context.getLastOutput();
        if (textToSynthesize == null || textToSynthesize.isBlank()) {
            return NodeResult.failure(node.getId(), node.getType(), "No text input for TTS synthesis");
        }

        log.info("TTS node [{}]: synthesizing {} chars of text", node.getId(), textToSynthesize.length());

        try {
            String audioUrl = ttsService.synthesize(textToSynthesize);
            log.info("TTS node [{}]: audio generated at {}", node.getId(), audioUrl);
            return NodeResult.success(node.getId(), node.getType(), audioUrl);
        } catch (Exception e) {
            log.error("TTS node [{}] failed: {}", node.getId(), e.getMessage());
            return NodeResult.failure(node.getId(), node.getType(), e.getMessage());
        }
    }
}
