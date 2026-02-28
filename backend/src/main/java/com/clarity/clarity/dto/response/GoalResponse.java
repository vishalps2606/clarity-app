package com.clarity.clarity.dto.response;

import com.clarity.clarity.domain.GoalPriority;
import com.clarity.clarity.domain.GoalStatus;
import java.time.LocalDateTime;

public record GoalResponse(
        Long id,
        String title,
        String description,
        GoalPriority priority,
        GoalStatus status,
        LocalDateTime createdAt,
        int totalTasks,
        int completedTasks
) {}