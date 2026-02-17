package com.clarity.clarity.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record TaskRequest(
        @NotBlank(message = "Title is required")
        String title,

        @NotNull(message = "Goal ID is required")
        Long goalId,

        @NotNull(message = "Estimated minutes are required")
        Integer estimatedMinutes,

        Integer actualMinutes,

//        @FutureOrPresent(message = "Due date cannot be in the past")
        LocalDateTime dueDatetime
) {}