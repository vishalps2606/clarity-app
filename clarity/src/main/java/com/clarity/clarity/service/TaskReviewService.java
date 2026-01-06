package com.clarity.clarity.service;

import com.clarity.clarity.entity.Task;
import com.clarity.clarity.domain.TaskStatus;
import com.clarity.clarity.dto.ReviewRequest;
import com.clarity.clarity.repository.TaskRepository;
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

    @Transactional
    public void reviewOverdueTasks() {

        List<Task> overdueTasks =
                taskRepository.findOverdueTasksForReview(
                        LocalDateTime.now(),
                        List.of(TaskStatus.READY, TaskStatus.IN_PROGRESS)
                );

        for (Task task : overdueTasks) {

            TaskStatus oldStatus = task.getStatus();
            boolean oldNeedsReview = task.isNeedsReview();

            if (task.getStatus() == TaskStatus.READY) {
                task.setStatus(TaskStatus.SKIPPED);
            } else if (task.getStatus() == TaskStatus.IN_PROGRESS) {
                task.setNeedsReview(true);
            }

            taskActivityLogService.log(
                    task.getId(),
                    "TASK_MARKED_OVERDUE",
                    "SYSTEM",
                    Map.of(
                            "oldStatus", oldStatus,
                            "newStatus", task.getStatus(),
                            "oldNeedsReview", oldNeedsReview,
                            "newNeedsReview", task.isNeedsReview(),
                            "dueDatetime", task.getDueDatetime()
                    )
            );
        }

        taskRepository.saveAll(overdueTasks);
    }

    @Transactional
    public void reviewTask(Long taskId, ReviewRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

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
    }
}
