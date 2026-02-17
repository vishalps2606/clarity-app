package com.clarity.clarity.service;

import com.clarity.clarity.domain.TaskStatus;
import com.clarity.clarity.dto.request.TimeBlockRequest;
import com.clarity.clarity.entity.Task;
import com.clarity.clarity.entity.TimeBlock;
import com.clarity.clarity.repository.TaskRepository;
import com.clarity.clarity.repository.TimeBlockRepository;
import com.clarity.clarity.util.SecurityUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimeBlockService {

    private final TimeBlockRepository timeBlockRepository;
    private final TaskRepository taskRepository;
    private final TaskActivityLogService activityLogService;
    private final DailyPlanningService dailyPlanningService;
    private final SecurityUtils securityUtils;

    @Transactional
    public TimeBlock createTimeBlock(TimeBlockRequest request) {

        Long userId = securityUtils.getCurrentUserId();

        // Extract Task ID from Request
        Long taskId = request.taskId();
        if (taskId == null) throw new IllegalArgumentException("Task ID is required");

        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found or access denied"));

        if (request.endTime().isBefore(request.startTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        long durationMinutes = Duration.between(request.startTime(), request.endTime()).toMinutes();
        dailyPlanningService.validateDayCapacity(request.startTime().toLocalDate(), durationMinutes);

        TimeBlock timeBlock = new TimeBlock();
        timeBlock.setTask(task);
        timeBlock.setUserId(userId);
        timeBlock.setStartTime(request.startTime());
        timeBlock.setEndTime(request.endTime());
        TimeBlock saved = timeBlockRepository.save(timeBlock);

        int currentActual = task.getActualMinutes() == null ? 0 : task.getActualMinutes();
        task.setActualMinutes(currentActual + (int) durationMinutes);

        if (task.getStatus() == TaskStatus.READY) {
            task.setStatus(TaskStatus.IN_PROGRESS);
        }

        taskRepository.save(task);

        try {
            activityLogService.log(taskId, "TIME_BLOCK_CREATED", "USER",
                    java.util.Map.of("minutesLogged", durationMinutes));
        } catch (Exception e) {
            log.warn("Exception occurred while saving time block", e);
        }

        return saved;
    }

    public List<TimeBlock> getBlocksForDay(java.time.LocalDate date) {
        Long userId = securityUtils.getCurrentUserId();
        java.time.LocalDateTime start = date.atStartOfDay();
        java.time.LocalDateTime end = date.plusDays(1).atStartOfDay();
        return timeBlockRepository.findByUserIdAndDate(userId, start, end);
    }

    @Transactional
    public void deleteBlock(Long id) {
        Long userId = securityUtils.getCurrentUserId();
        timeBlockRepository.deleteByIdAndUserId(id, userId);
    }
}