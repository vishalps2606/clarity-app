package com.clarity.clarity.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record TimeBlockRequest(
        @NotNull LocalDateTime startTime,
        @NotNull LocalDateTime endTime
) {}
