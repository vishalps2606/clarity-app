package com.clarity.clarity.service;

import com.clarity.clarity.entity.Task;
import com.clarity.clarity.domain.TaskStatus;
import com.clarity.clarity.dto.request.ReviewRequest;
import com.clarity.clarity.repository.TaskRepository;
import com.clarity.clarity.util.SecurityUtils; // Import this!
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TaskReviewService {

    private final TaskRepository taskRepository;
    private final TaskActivityLogService taskActivityLogService;
    private final SecurityUtils securityUtils; // Inject for user actions

    // SYSTEM CONTEXT: Run by Scheduler (DailyTaskReviewScheduler)
    @Transactional
    public void reviewOverdueTasks() {
        // FIX: Use System query
        List<Task> overdueTasks = taskRepository.findAllOverdueTasksForSystem(
                LocalDateTime.now(),
                List.of(TaskStatus.READY, TaskStatus.IN_PROGRESS)
        );

        for (Task task : overdueTasks) {
            TaskStatus oldStatus = task.getStatus();
            boolean oldNeedsReview = task.isNeedsReview();

            if (task.getStatus() == TaskStatus.READY) {
                task.setStatus(TaskStatus.SKIPPED); // Auto-skip stale tasks
            } else if (task.getStatus() == TaskStatus.IN_PROGRESS) {
                task.setNeedsReview(true); // Flag active tasks for review
            }

            taskActivityLogService.log(
                    task.getId(), "TASK_MARKED_OVERDUE", "SYSTEM",
                    Map.of("oldStatus", oldStatus, "newStatus", task.getStatus())
            );
        }
        taskRepository.saveAll(overdueTasks);
    }

    // USER CONTEXT: Run by API (TaskController)
    @Transactional
    public void reviewTask(Long taskId, ReviewRequest request) {
        Long userId = securityUtils.getCurrentUserId();

        // FIX: SECURE FETCH. Prevent reviewing other people's tasks.
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found or access denied"));

        if (!task.isNeedsReview()) {
            throw new IllegalStateException("Task does not require review");
        }

        task.setReviewNote(request.note());
        task.setReviewDecision(request.decision());

        switch (request.decision()) {
            case RESUME, ACCEPT_DELAY -> {
                task.setStatus(TaskStatus.READY);
                task.setDueDatetime(request.newDueDatetime());
            }
            case DROP -> task.setStatus(TaskStatus.SKIPPED);
        }
        task.setNeedsReview(false);
        taskRepository.save(task); // Explicit save
    }
}