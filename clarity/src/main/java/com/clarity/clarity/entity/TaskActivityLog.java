package com.clarity.clarity.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_activity_logs")
@Data
public class TaskActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long taskId;

    private String action;

    private String performedBy; // USER / SYSTEM

    @Column(columnDefinition = "jsonb")
    private String metadata;

    private LocalDateTime createdAt;
}
