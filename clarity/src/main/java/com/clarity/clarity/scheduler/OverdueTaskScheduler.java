package com.clarity.clarity.scheduler;

import com.clarity.clarity.domain.TaskStatus;
import com.clarity.clarity.entity.Task;
import com.clarity.clarity.repository.TaskRepository;
import com.clarity.clarity.service.TaskActivityLogService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class OverdueTaskScheduler {

    private final TaskRepository taskRepository;
    private final TaskActivityLogService taskActivityLogService;

    // Runs every day at 00:10
    @Scheduled(cron = "0 10 0 * * *")
    @Transactional
    public void markOverdueTasksForReview() {

        LocalDateTime now = LocalDateTime.now();

        List<TaskStatus> activeStatuses = List.of(
                TaskStatus.READY,
                TaskStatus.IN_PROGRESS
        );

        List<Task> overdueTasks =
                taskRepository.findOverdueTasksForReview(now, activeStatuses);

        if (overdueTasks.isEmpty()) {
            return;
        }

        for (Task task : overdueTasks) {
            task.setNeedsReview(true);

            log.warn(
                    "⚠️ TASK OVERDUE | TaskId={} | Title={} | Due={}",
                    task.getId(),
                    task.getTitle(),
                    task.getDueDatetime()
            );

            taskActivityLogService.log(
                    task.getId(),
                    "TASK_FLAGGED_FOR_REVIEW",
                    "SYSTEM",
                    Map.of(
                            "dueDatetime", task.getDueDatetime()
                    )
            );
        }
    }
}

