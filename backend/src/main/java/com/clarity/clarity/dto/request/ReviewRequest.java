package com.clarity.clarity.dto.request;

import com.clarity.clarity.domain.TaskReviewDecision;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record ReviewRequest(

        @NotNull
        TaskReviewDecision decision,

        @NotBlank
        String note,

        LocalDateTime newDueDatetime

) {}
