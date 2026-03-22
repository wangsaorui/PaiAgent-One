package com.paiagent.engine;

import com.paiagent.model.dto.ExecutionEventDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class ExecutionEventEmitter {

    private final ConcurrentHashMap<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public void register(String executionId, SseEmitter emitter) {
        emitters.put(executionId, emitter);
        log.info("SSE emitter registered for execution: {}", executionId);
        emitter.onCompletion(() -> {
            log.info("SSE emitter completed for execution: {}", executionId);
            emitters.remove(executionId);
        });
        emitter.onTimeout(() -> {
            log.warn("SSE emitter timeout for execution: {}", executionId);
            emitters.remove(executionId);
        });
        emitter.onError(e -> {
            log.warn("SSE emitter error for execution {}: {}", executionId, e.getMessage());
            emitters.remove(executionId);
        });
    }

    public void emit(String executionId, ExecutionEventDTO event) {
        SseEmitter emitter = emitters.get(executionId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .data(event));
                log.debug("Sent SSE event {} for execution {}", event.getType(), executionId);
            } catch (IOException e) {
                log.warn("Failed to send SSE event for execution {}: {}", executionId, e.getMessage());
                emitters.remove(executionId);
            }
        } else {
            log.warn("No SSE emitter found for execution {}, event {} was not sent", executionId, event.getType());
        }
    }

    public void complete(String executionId) {
        SseEmitter emitter = emitters.remove(executionId);
        if (emitter != null) {
            emitter.complete();
        }
    }
}
