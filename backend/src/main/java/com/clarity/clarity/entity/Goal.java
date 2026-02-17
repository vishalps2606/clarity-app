package com.clarity.clarity.entity;

import com.clarity.clarity.domain.GoalPriority;
import com.clarity.clarity.domain.GoalStatus;
import com.clarity.clarity.domain.TaskStatus; // <--- Import this
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty; // <--- Import this
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "goals")
@Data
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private GoalStatus status;

    @Enumerated(EnumType.STRING)
    private GoalPriority priority;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // 1. Hide the raw list of tasks to prevent infinite JSON recursion
    @OneToMany(mappedBy = "goal", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Task> tasks = new ArrayList<>();

    // 2. VIRTUAL FIELD: Calculate progress on the fly
    @JsonProperty("progress")
    public double getProgress() {
        if (tasks == null || tasks.isEmpty()) {
            return 0.0;
        }
        long completedCount = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE)
                .count();

        // Returns decimal 0.0 to 1.0 (e.g., 0.5 for 50%)
        return (double) completedCount / tasks.size();
    }
}