package com.clarity.clarity.domain;

import jakarta.persistence.*;
import jdk.jfr.DataAmount;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "goal_id")
    private Goal goal;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    private LocalDateTime dueDatetime;
    private Integer estimatedMinutes;
    private Integer actualMinutes;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
