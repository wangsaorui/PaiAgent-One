package com.paiagent.service;

import java.util.Map;

public interface TTSService {
    String synthesize(String text);

    String synthesize(String text, Map<String, Object> config);
}
