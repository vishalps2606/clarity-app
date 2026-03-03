package com.clarity.clarity.service;

import com.clarity.clarity.dto.request.TaskRequest;
import com.clarity.clarity.dto.response.TaskResponse;
import com.clarity.clarity.entity.Goal;
import com.clarity.clarity.entity.Task;
import com.clarity.clarity.repository.GoalRepository;
import com.clarity.clarity.repository.TaskRepository;
import com.clarity.clarity.repository.TimeBlockRepository;
import com.clarity.clarity.util.SecurityUtils;
import com.clarity.clarity.domain.TaskStatus;
import com.clarity.clarity.domain.GoalStatus;
import com.clarity.clarity.domain.RecurrenceType;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
        if (request.dueDatetime() != null &&
                request.dueDatetime().isBefore(LocalDateTime.now().minusMinutes(1))) {
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
        task.setRecurrenceType(request.recurrenceType() != null ? request.recurrenceType() : RecurrenceType.NONE);
        task.setRecurrencePattern(request.recurrencePattern());

        Task savedTask = taskRepository.save(task);
        activityLogService.log(savedTask.getId(), "TASK_CREATED", "USER", Collections.emptyMap());
        return savedTask;
    }

    @Transactional
    public void completeTask(Long taskId) {
        Long userId = securityUtils.getCurrentUserId();
        Task task = taskRepository.findByIdAndUserIdAndDeletedFalse(taskId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        task.setStatus(TaskStatus.DONE);
        taskRepository.save(task);

        activityLogService.log(taskId, "TASK_COMPLETED", "USER", Collections.emptyMap());

        // 1. RECURRENCE ENGINE
        handleRecurrence(task, userId);

        // 2. GOAL AUTOMATION (Check if Goal is now complete)
        updateGoalStatusIfComplete(task.getGoal());
    }

    private void handleRecurrence(Task task, Long userId) {
        if (task.getRecurrenceType() != null && task.getRecurrenceType() != RecurrenceType.NONE) {
            LocalDateTime baseDate = (task.getDueDatetime() != null) ? task.getDueDatetime() : LocalDateTime.now();
            LocalDateTime nextDue = calculateNextOccurrence(baseDate, task.getRecurrenceType(), task.getRecurrencePattern());

            boolean alreadyExists = taskRepository.existsByUserIdAndTitleAndGoalIdAndDueDatetimeAndDeletedFalse(
                    userId, task.getTitle(), task.getGoal().getId(), nextDue
            );

            if (!alreadyExists) {
                Task nextTask = new Task();
                nextTask.setTitle(task.getTitle());
                nextTask.setGoal(task.getGoal());
                nextTask.setEstimatedMinutes(task.getEstimatedMinutes());
                nextTask.setUserId(userId);
                nextTask.setRecurrenceType(task.getRecurrenceType());
                nextTask.setRecurrencePattern(task.getRecurrencePattern());
                nextTask.setStatus(TaskStatus.READY);
                nextTask.setDueDatetime(nextDue);
                taskRepository.save(nextTask);
            }
        }
    }

    private void updateGoalStatusIfComplete(Goal goal) {
        if (goal != null) {
            // Re-fetch goal to get latest tasks or use the relationship
            boolean allDone = goal.getTasks().stream()
                    .filter(t -> !t.isDeleted())
                    .allMatch(t -> t.getStatus() == TaskStatus.DONE || t.getStatus() == TaskStatus.SKIPPED);

            if (allDone && !goal.getTasks().isEmpty()) {
                goal.setStatus(GoalStatus.DONE);
                goalRepository.save(goal);
            }
        }
    }

    private LocalDateTime calculateNextOccurrence(LocalDateTime current, RecurrenceType type, String pattern) {
        return switch (type) {
            case DAILY -> (pattern != null && !pattern.isEmpty())
                    ? findNextDayInPattern(current, pattern)
                    : current.plusDays(1);
            case WEEKLY -> current.plusWeeks(1);
            case MONTHLY -> current.plusMonths(1);
            default -> current;
        };
    }

    private LocalDateTime findNextDayInPattern(LocalDateTime current, String pattern) {
        Set<DayOfWeek> activeDays = Arrays.stream(pattern.split(","))
                .map(String::trim).map(String::toUpperCase).map(DayOfWeek::valueOf)
                .collect(Collectors.toSet());

        LocalDateTime next = current;
        for (int i = 1; i <= 7; i++) {
            next = next.plusDays(1);
            if (activeDays.contains(next.getDayOfWeek())) return next;
        }
        return current.plusDays(1);
    }

    // --- SECURE USER QUERIES ---

    public List<TaskResponse> getTasksByGoal(Long goalId) {
        Long userId = securityUtils.getCurrentUserId();

        // Ensure user owns the goal first
        goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found or access denied"));

        // FIX: Return mapped DTOs and ignore deleted tasks
        return taskRepository.findByGoalIdAndUserIdAndDeletedFalse(goalId, userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<Task> getTasksNeedingReview() {
        return taskRepository.findByNeedsReviewTrueAndUserIdAndDeletedFalse(securityUtils.getCurrentUserId());
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAllByUserIdAndDeletedFalse(securityUtils.getCurrentUserId());
    }

    public Task getTaskById(Long id) {
        return taskRepository.findByIdAndUserIdAndDeletedFalse(id, securityUtils.getCurrentUserId())
                .orElseThrow(() -> new EntityNotFoundException("Task not found or access denied"));
    }

    @Transactional
    public void deleteTask(Long taskId) {
        Task task = getTaskById(taskId); // Reuses secure fetch
        task.setDeleted(true);
        taskRepository.save(task);
        timeBlockRepository.deleteAllByTaskId(taskId);
    }

    @Transactional
    public Task updateTask(Long id, TaskRequest request) {
        Task task = getTaskById(id); // Reuses secure fetch

        task.setTitle(request.title());
        task.setEstimatedMinutes(request.estimatedMinutes());
        if (request.actualMinutes() != null) task.setActualMinutes(request.actualMinutes());
        task.setDueDatetime(request.dueDatetime());

        if (request.goalId() != null && !request.goalId().equals(task.getGoal().getId())) {
            Goal newGoal = goalRepository.findByIdAndUserId(request.goalId(), securityUtils.getCurrentUserId())
                    .orElseThrow(() -> new IllegalArgumentException("Target goal not found"));
            task.setGoal(newGoal);
        }
        return taskRepository.save(task);
    }

    public TaskResponse mapToResponse(Task task) {
        return new TaskResponse(
                task.getId(), task.getTitle(), task.getStatus(), task.getDueDatetime(),
                task.getEstimatedMinutes(), task.getActualMinutes(), task.getRecurrenceType(),
                task.getRecurrencePattern(), task.getGoal().getId(), task.getGoal().getTitle()
        );
    }
}