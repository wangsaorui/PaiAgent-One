package com.paiagent.service.impl;

import com.paiagent.service.TTSService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MockTTSServiceImpl implements TTSService {

    @Override
    public String synthesize(String text) {
        log.info("Mock TTS synthesize called. Text length: {} chars", text.length());
        log.debug("Text to synthesize: {}", text);
        // Return the static placeholder audio path
        return "/audio/sample.mp3";
    }
}
