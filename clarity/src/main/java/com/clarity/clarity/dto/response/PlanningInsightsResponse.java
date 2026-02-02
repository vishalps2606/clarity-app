package com.clarity.clarity.dto.response;

public record PlanningInsightsResponse(
        int totalTasks,
        int completedTasks,
        int completionPercentage,
        int tasksWithSlippage,
        int slippagePercentage,
        long avgEstimationErrorMinutes, // Positive = You underestimate time
        String feedbackMessage // "You are ambitious, but unrealistic."
) {}