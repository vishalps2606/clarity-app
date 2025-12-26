package com.clarity.clarity.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record ReminderRequest(
        @NotNull LocalDateTime remindAt
) {}
