package com.clarity.clarity.dto.response;

import com.clarity.clarity.domain.TaskStatus;
import com.clarity.clarity.domain.RecurrenceType;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        TaskStatus status,
        LocalDateTime dueDatetime,
        Integer estimatedMinutes,
        Integer actualMinutes,
        RecurrenceType recurrenceType,
        String recurrencePattern,
        Long goalId,
        String goalTitle
) {}