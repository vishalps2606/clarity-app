package com.clarity.clarity.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record ReminderRequest(
        @NotNull LocalDateTime remindAt
) {}
