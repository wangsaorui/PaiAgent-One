package com.paiagent.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "execution_records")
public class ExecutionRecord {

    @Id
    private String id;

    @Column(name = "workflow_id", nullable = false)
    private String workflowId;

    @Column(nullable = false)
    private String status;

    @Column(name = "input_text", columnDefinition = "TEXT")
    private String inputText;

    @Column(name = "result_audio_url", length = 500)
    private String resultAudioUrl;

    @Column(name = "node_results", columnDefinition = "TEXT")
    private String nodeResults;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
