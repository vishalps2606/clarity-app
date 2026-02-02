package com.clarity.clarity.service;

import com.clarity.clarity.dto.response.PlanningInsightsResponse;
import com.clarity.clarity.entity.Task;
import com.clarity.clarity.entity.TaskActivityLog;
import com.clarity.clarity.repository.TaskActivityLogRepository;
import com.clarity.clarity.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanningInsightsService {

    private final TaskRepository taskRepository;
    private final TaskActivityLogRepository logRepository;

    @Transactional(readOnly = true)
    public PlanningInsightsResponse getWeeklyInsights() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        // 1. Fetch Data
        List<Task> recentTasks = taskRepository.findAll().stream()
                .filter(t -> t.getCreatedAt().isAfter(sevenDaysAgo))
                .toList();

        List<TaskActivityLog> recentLogs = logRepository.findByCreatedAtAfter(sevenDaysAgo);

        // 2. Calculate Completion
        int total = recentTasks.size();
        int completed = (int) recentTasks.stream()
                .filter(t -> "DONE".equals(t.getStatus().name()))
                .count();

        int completionRate = total == 0 ? 0 : (completed * 100 / total);

        // 3. Calculate Slippage (Tasks that were delayed via Review)
        // We look for logs where action="TASK_REVIEWED" and metadata contains "ACCEPT_DELAY"
        // Using string detection for speed, but could be parsed with Jackson
        Set<Long> slippedTaskIds = recentLogs.stream()
                .filter(l -> "TASK_REVIEWED".equals(l.getAction()))
                .filter(l -> l.getMetadata().contains("ACCEPT_DELAY"))
                .map(TaskActivityLog::getTaskId)
                .collect(Collectors.toSet());

        int slippageCount = slippedTaskIds.size();
        int slippageRate = total == 0 ? 0 : (slippageCount * 100 / total);

        // 4. Estimation Error (Actual vs Estimated)
        // Only for tasks that have both values
        double avgError = recentTasks.stream()
                .filter(t -> t.getActualMinutes() != null && t.getEstimatedMinutes() != null)
                .mapToLong(t -> t.getActualMinutes() - t.getEstimatedMinutes())
                .average()
                .orElse(0.0);

        // 5. Generate Brutal Feedback
        String feedback = generateFeedback(completionRate, slippageRate, avgError);

        return new PlanningInsightsResponse(
                total,
                completed,
                completionRate,
                slippageCount,
                slippageRate,
                (long) avgError,
                feedback
        );
    }

    private String generateFeedback(int completion, int slippage, double error) {
        if (completion < 50) return "You start a lot, but finish nothing. Focus on one goal.";
        if (slippage > 30) return "You are negotiating with yourself too much. Stick to the plan.";
        if (error > 30) return "You chronically underestimate tasks. Double your estimates.";
        return "Solid week. You are executing well.";
    }
}