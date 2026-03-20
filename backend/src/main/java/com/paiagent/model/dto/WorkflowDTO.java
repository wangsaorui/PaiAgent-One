package com.paiagent.model.dto;

import lombok.Data;

@Data
public class WorkflowDTO {
    private String id;
    private String name;
    private Object definition;
    private String createdAt;
    private String updatedAt;
}
