package com.clarity.clarity.entity;

import com.clarity.clarity.domain.TaskReviewDecision;
import com.clarity.clarity.domain.TaskStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @Column(nullable = false)
    private boolean needsReview = false;

    @Column(length = 500)
    private String reviewNote;

    @Enumerated(EnumType.STRING)
    private TaskReviewDecision reviewDecision;

    @Column(name = "user_id", nullable = false)
    private Long userId;
//
//    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<TimeBlock> timeBlocks = new ArrayList<>();
}
