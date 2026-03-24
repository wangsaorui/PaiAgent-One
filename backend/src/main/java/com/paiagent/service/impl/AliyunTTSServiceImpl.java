package com.paiagent.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.paiagent.service.MinioService;
import com.paiagent.service.TTSService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class AliyunTTSServiceImpl implements TTSService {

    private static final String TTS_API_URL =
            "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final MinioService minioService;

    @Override
    public String synthesize(String text) {
        return synthesize(text, null);
    }

    @Override
    public String synthesize(String text, Map<String, Object> config) {
        String apiKey      = config != null ? (String) config.get("apiKey") : null;
        String model       = config != null && config.get("model") != null
                ? (String) config.get("model") : "qwen3-tts-flash";
        String voice       = config != null && config.get("voice") != null
                ? (String) config.get("voice") : "Cherry";
        String languageType = config != null && config.get("languageType") != null
                ? (String) config.get("languageType") : "Auto";

        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("API key not configured for TTS. Please set it in the TTS node config.");
        }

        try {
            log.info("=== TTS HTTP Call ===");
            log.info("Model: {}", model);
            log.info("Voice: {}", voice);
            log.info("Language: {}", languageType);
            log.info("Text length: {} chars", text.length());

            // 构造请求体
            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "model", model,
                    "input", Map.of(
                            "text", text,
                            "voice", voice,
                            "language_type", languageType
                    )
            ));
            log.debug("TTS request body: {}", requestBody);

            // 发起 HTTP 请求
            String responseBody = callApi(TTS_API_URL, apiKey, requestBody);
            log.debug("TTS response: {}", responseBody);

            // 解析响应，获取音频 URL
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode audioNode = root.path("output").path("audio");
            if (audioNode.isMissingNode() || audioNode.isNull()) {
                throw new RuntimeException("TTS response missing output.audio, response: " + responseBody);
            }
            String audioDownloadUrl = audioNode.path("url").asText();
            if (audioDownloadUrl == null || audioDownloadUrl.isBlank()) {
                throw new RuntimeException("TTS response missing audio URL, response: " + responseBody);
            }
            log.info("TTS audio URL: {}", audioDownloadUrl);

            // 下载音频并上传到 MinIO
            byte[] audioBytes = downloadAudio(audioDownloadUrl);
            String objectName = "audio/" + UUID.randomUUID() + ".mp3";
            String audioUrl = minioService.upload(objectName, audioBytes, "audio/mpeg");
            log.info("Audio uploaded to MinIO: {}", audioUrl);
            return audioUrl;

        } catch (Exception e) {
            log.error("TTS call failed: {}", e.getMessage(), e);
            throw new RuntimeException("TTS synthesis failed: " + e.getMessage(), e);
        }
    }

    private String callApi(String apiUrl, String apiKey, String requestBody) throws IOException {
        URL url = new URL(apiUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setDoOutput(true);
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(60000);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Authorization", "Bearer " + apiKey);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(requestBody.getBytes(StandardCharsets.UTF_8));
        }

        int statusCode = conn.getResponseCode();
        InputStream is = statusCode >= 400 ? conn.getErrorStream() : conn.getInputStream();
        String response = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        if (statusCode >= 400) {
            throw new RuntimeException("TTS API returned HTTP " + statusCode + ": " + response);
        }
        return response;
    }

    private byte[] downloadAudio(String urlString) throws IOException {
        URL url = new URL(urlString);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(30000);
        try (InputStream inputStream = conn.getInputStream()) {
            return inputStream.readAllBytes();
        }
    }

}
