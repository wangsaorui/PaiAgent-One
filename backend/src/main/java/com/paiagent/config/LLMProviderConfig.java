package com.paiagent.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Data
@Configuration
@ConfigurationProperties(prefix = "llm")
public class LLMProviderConfig {

    private Map<String, ProviderProperties> providers = new HashMap<>();

    @Data
    public static class ProviderProperties {
        private String baseUrl;
        private String apiKey;
        private String defaultModel;
    }

    public ProviderProperties getProvider(String name) {
        return providers.get(name);
    }
}
