package com.clarity.clarity.dto.request;

import com.clarity.clarity.domain.GoalPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GoalRequest(
        @NotBlank String title,
        @NotNull GoalPriority priority
) {}