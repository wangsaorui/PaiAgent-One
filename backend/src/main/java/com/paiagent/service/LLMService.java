package com.paiagent.service;

public interface LLMService {
    String chat(String provider, String model, String systemPrompt, String userMessage, double temperature);
}
