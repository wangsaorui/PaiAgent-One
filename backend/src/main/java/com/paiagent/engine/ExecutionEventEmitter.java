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
        emitter.onCompletion(() -> emitters.remove(executionId));
        emitter.onTimeout(() -> emitters.remove(executionId));
        emitter.onError(e -> emitters.remove(executionId));
    }

    public void emit(String executionId, ExecutionEventDTO event) {
        SseEmitter emitter = emitters.get(executionId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name(event.getType())
                        .data(event));
            } catch (IOException e) {
                log.warn("Failed to send SSE event for execution {}: {}", executionId, e.getMessage());
                emitters.remove(executionId);
            }
        }
    }

    public void complete(String executionId) {
        SseEmitter emitter = emitters.remove(executionId);
        if (emitter != null) {
            emitter.complete();
        }
    }
}
