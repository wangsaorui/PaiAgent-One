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
        return chat(provider, model, systemPrompt, userMessage, temperature, null, null);
    }

    @Override
    public String chat(String provider, String model, String systemPrompt, String userMessage, double temperature,
                       String apiKeyOverride, String baseUrlOverride) {
        // Determine API key: node config > application.yml
        String apiKey = apiKeyOverride;
        String baseUrl = baseUrlOverride;

        LLMProviderConfig.ProviderProperties props = providerConfig.getProvider(provider);
        if (apiKey == null || apiKey.isBlank()) {
            if (props != null) {
                apiKey = props.getApiKey();
            }
        }
        if (baseUrl == null || baseUrl.isBlank()) {
            if (props != null) {
                baseUrl = props.getBaseUrl();
            }
        }

        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("API key not configured for provider [" + provider
                    + "]. Please set it in the LLM node config or application.yml.");
        }
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new RuntimeException("Base URL not configured for provider [" + provider + "].");
        }

        // Use baseUrl directly if it's already a complete API URL, otherwise append /chat/completions
        String url = baseUrl;
        if (!baseUrl.contains("/chat/completions")) {
            String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
            if (!normalizedBaseUrl.endsWith("/v1")) {
                normalizedBaseUrl = normalizedBaseUrl + "/v1";
            }
            url = normalizedBaseUrl + "/chat/completions";
        }
        String actualModel = (model != null && !model.isBlank()) ? model
                : (props != null ? props.getDefaultModel() : "");

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

            log.info("=== LLM API Call ===");
            log.info("Provider: {}", provider);
            log.info("Model: {}", actualModel);
            log.info("URL: {}", url);
            log.info("Request Body: {}", bodyJson);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            log.info("Response Status: {}", response.getStatusCode());
            log.info("Response Body: {}", response.getBody());

            JsonNode root = objectMapper.readTree(response.getBody());
            String content = root.path("choices").get(0).path("message").path("content").asText();
            log.info("Extracted Content Length: {} chars", content.length());
            return content;
        } catch (org.springframework.web.client.HttpClientErrorException | org.springframework.web.client.HttpServerErrorException e) {
            log.error("=== LLM API Error ===");
            log.error("Provider: {}", provider);
            log.error("URL: {}", url);
            log.error("Status Code: {}", e.getStatusCode());
            log.error("Response Body: {}", e.getResponseBodyAsString());
            throw new RuntimeException("LLM API error [" + e.getStatusCode() + "]: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("LLM call failed for provider [{}]: {}", provider, e.getMessage(), e);
            throw new RuntimeException("LLM call failed: " + e.getMessage(), e);
        }
    }
}
