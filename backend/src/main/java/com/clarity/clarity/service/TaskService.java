package com.clarity.clarity.service;

import com.clarity.clarity.domain.GoalStatus;
import com.clarity.clarity.domain.RecurrenceType;
import com.clarity.clarity.dto.request.TaskRequest;
import com.clarity.clarity.entity.Goal;
import com.clarity.clarity.entity.Task;
import com.clarity.clarity.repository.GoalRepository;
import com.clarity.clarity.repository.TaskRepository;
import com.clarity.clarity.repository.TimeBlockRepository;
import com.clarity.clarity.util.SecurityUtils;
import com.clarity.clarity.domain.TaskStatus;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final GoalRepository goalRepository;
    private final SecurityUtils securityUtils;
    private final TaskActivityLogService activityLogService;
    private final TimeBlockRepository timeBlockRepository;

    @Transactional
    public Task createTask(TaskRequest request) {
        if (request.dueDatetime() != null && request.dueDatetime().isBefore(java.time.LocalDateTime.now().minusMinutes(1))) {
            throw new IllegalArgumentException("Due date must be in the future");
        }

        Long userId = securityUtils.getCurrentUserId();
        Goal goal = goalRepository.findByIdAndUserId(request.goalId(), userId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found or access denied"));

        Task task = new Task();
        task.setTitle(request.title());
        task.setGoal(goal);
        task.setEstimatedMinutes(request.estimatedMinutes());
        task.setDueDatetime(request.dueDatetime());
        task.setStatus(TaskStatus.READY);
        task.setUserId(userId);

        if (request.recurrenceType() != null) {
            task.setRecurrenceType(request.recurrenceType());
        } else {
            task.setRecurrenceType(RecurrenceType.NONE);
        }

        Task savedTask = taskRepository.save(task);
        activityLogService.log(savedTask.getId(), "TASK_CREATED", "USER", Collections.emptyMap());
        return savedTask;
    }

    @Transactional
    public void completeTask(Long taskId) {
        Long userId = securityUtils.getCurrentUserId();
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        task.setStatus(TaskStatus.DONE);
        taskRepository.save(task);

        activityLogService.log(taskId, "TASK_COMPLETED", "USER", java.util.Collections.emptyMap());

        if (task.getRecurrenceType() != null && task.getRecurrenceType() != RecurrenceType.NONE) {
            Task nextTask = new Task();
            nextTask.setTitle(task.getTitle());
            nextTask.setGoal(task.getGoal());
            nextTask.setEstimatedMinutes(task.getEstimatedMinutes());
            nextTask.setUserId(userId);
            nextTask.setRecurrenceType(task.getRecurrenceType());
            nextTask.setStatus(TaskStatus.READY);

            if (task.getDueDatetime() != null) {
                java.time.LocalDateTime nextDue = switch (task.getRecurrenceType()) {
                    case DAILY -> task.getDueDatetime().plusDays(1);
                    case WEEKLY -> task.getDueDatetime().plusWeeks(1);
                    case MONTHLY -> task.getDueDatetime().plusMonths(1);
                    default -> task.getDueDatetime();
                };
                nextTask.setDueDatetime(nextDue);
            }

            taskRepository.save(nextTask);
        }
        Goal goal = task.getGoal();
        if (goal != null) {
            boolean allDone = goal.getTasks().stream()
                    .allMatch(t -> t.getStatus() == TaskStatus.DONE || t.getStatus() == TaskStatus.SKIPPED);

            if (allDone && !goal.getTasks().isEmpty()) {
                goal.setStatus(GoalStatus.DONE);
                goalRepository.save(goal);
            }
        }
    }

    public List<Task> getTasksByGoal(Long goalId) {
        Long userId = securityUtils.getCurrentUserId();

        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found or access denied"));

        return taskRepository.findByGoalIdAndUserId(goal.getId(), userId);
    }

    public List<Task> getAllTasks() {
        Long userId = securityUtils.getCurrentUserId();
        return taskRepository.findAllByUserId(userId);
    }

    public List<Task> getTasksNeedingReview() {
        Long userId = securityUtils.getCurrentUserId();
        return taskRepository.findByNeedsReviewTrueAndUserId(userId);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        Long userId = securityUtils.getCurrentUserId();
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found or access denied"));

        timeBlockRepository.deleteAllByTaskId(taskId);

        taskRepository.delete(task);
    }

    public Task getTaskById(Long id) {
        Long userId = securityUtils.getCurrentUserId(); // <--- SECURITY CHECK
        return taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found or access denied"));
    }

    @Transactional
    public Task updateTask(Long id, TaskRequest request) {
        Long userId = securityUtils.getCurrentUserId();

        Task task = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found or access denied"));

        task.setTitle(request.title());
        task.setEstimatedMinutes(request.estimatedMinutes());

        if (request.actualMinutes() != null) {
            task.setActualMinutes(request.actualMinutes());
        }

        task.setDueDatetime(request.dueDatetime());

        if (request.goalId() != null && !request.goalId().equals(task.getGoal().getId())) {
            Goal newGoal = goalRepository.findByIdAndUserId(request.goalId(), userId)
                    .orElseThrow(() -> new IllegalArgumentException("Target goal not found"));
            task.setGoal(newGoal);
        }

        return taskRepository.save(task);
    }
}