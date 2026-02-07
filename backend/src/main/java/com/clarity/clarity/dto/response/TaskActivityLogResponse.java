package com.clarity.clarity.dto.response;

import java.time.LocalDateTime;
import java.util.Map;

public record TaskActivityLogResponse(
        Long id,
        String action,
        String performedBy, // Matches your entity
        Map<String, Object> metadata,
        LocalDateTime createdAt
) {}