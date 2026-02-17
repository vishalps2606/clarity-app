package com.clarity.clarity.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record TimeBlockRequest(
        @NotNull(message = "Task ID is required")
        Long taskId, // <--- ADD THIS

        @NotNull(message = "Start time is required")
        LocalDateTime startTime,

        @NotNull(message = "End time is required")
        LocalDateTime endTime
) {}
