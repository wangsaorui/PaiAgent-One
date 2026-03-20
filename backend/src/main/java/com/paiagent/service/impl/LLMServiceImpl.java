package com.paiagent.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.paiagent.config.LLMProviderConfig;
import com.paiagent.service.LLMService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LLMServiceImpl implements LLMService {

    private final LLMProviderConfig providerConfig;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String chat(String provider, String model, String systemPrompt, String userMessage, double temperature) {
        LLMProviderConfig.ProviderProperties props = providerConfig.getProvider(provider);
        if (props == null) {
            throw new RuntimeException("Unknown LLM provider: " + provider);
        }

        String apiKey = props.getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("API key not configured for provider [{}], returning mock response", provider);
            return "[Mock LLM Response] 这是一段模拟的播客文稿。用户输入: " + userMessage
                    + "\n\n大家好，欢迎收听本期AI播客！今天我们来聊聊一个非常有趣的话题。"
                    + "在人工智能飞速发展的今天，我们每个人都在见证着技术的变革。"
                    + "让我们一起深入探讨这个话题的方方面面吧！";
        }

        String url = props.getBaseUrl() + "/chat/completions";
        String actualModel = (model != null && !model.isBlank()) ? model : props.getDefaultModel();

        Map<String, Object> requestBody = Map.of(
                "model", actualModel,
                "temperature", temperature,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        try {
            String bodyJson = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> entity = new HttpEntity<>(bodyJson, headers);

            log.info("Calling LLM [{}] model [{}]", provider, actualModel);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            log.error("LLM call failed for provider [{}]: {}", provider, e.getMessage());
            throw new RuntimeException("LLM call failed: " + e.getMessage(), e);
        }
    }
}
