package com.clarity.clarity.dto.request;

import com.clarity.clarity.domain.RecurrenceType;
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

        LocalDateTime dueDatetime,

        RecurrenceType recurrenceType
) {}