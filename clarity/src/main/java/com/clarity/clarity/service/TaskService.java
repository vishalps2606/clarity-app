package com.clarity.clarity.service;

import com.clarity.clarity.dto.request.TaskRequest;
import com.clarity.clarity.entity.Goal;
import com.clarity.clarity.entity.Task;
import com.clarity.clarity.repository.GoalRepository;
import com.clarity.clarity.repository.TaskRepository;
import com.clarity.clarity.util.SecurityUtils;
import com.clarity.clarity.domain.TaskStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final GoalRepository goalRepository;
    private final SecurityUtils securityUtils;
    private final TaskActivityLogService activityLogService;

    @Transactional
    public Task createTask(TaskRequest request) {
        Long userId = securityUtils.getCurrentUserId();

        Goal goal = goalRepository.findByIdAndUserId(request.goalId(), userId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found or access denied"));

        Task task = new Task();
        task.setTitle(request.title());
        task.setId(goal.getId());
        task.setEstimatedMinutes(request.estimatedMinutes());
        task.setDueDatetime(request.dueDatetime());
        task.setStatus(TaskStatus.READY);
        task.setUserId(userId); // Stamp User ID

        Task savedTask = taskRepository.save(task);
        activityLogService.log(savedTask.getId(), "TASK_CREATED", "USER", java.util.Collections.emptyMap());

        return savedTask;
    }

    public List<Task> getAllTasks() {
        Long userId = securityUtils.getCurrentUserId();
        return taskRepository.findAllByUserId(userId);
    }

    // NEW SECURE METHOD
    public List<Task> getTasksNeedingReview() {
        Long userId = securityUtils.getCurrentUserId();
        // Calls the new secure repository method
        return taskRepository.findByNeedsReviewTrueAndUserId(userId);
    }
}