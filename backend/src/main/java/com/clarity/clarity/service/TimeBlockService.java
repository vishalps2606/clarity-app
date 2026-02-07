package com.clarity.clarity.service;

import com.clarity.clarity.dto.request.TimeBlockRequest; // Ensure you use your Request DTO package
import com.clarity.clarity.entity.Task;
import com.clarity.clarity.entity.TimeBlock;
import com.clarity.clarity.repository.TaskRepository;
import com.clarity.clarity.repository.TimeBlockRepository;
import com.clarity.clarity.util.SecurityUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Slf4j
@Service
public class TimeBlockService {

    private final TimeBlockRepository timeBlockRepository;
    private final TaskRepository taskRepository;
    private final TaskActivityLogService activityLogService;
    private final DailyPlanningService dailyPlanningService;
    private final SecurityUtils securityUtils;

    // Constructor Injection
    public TimeBlockService(TimeBlockRepository timeBlockRepository,
                            TaskRepository taskRepository,
                            TaskActivityLogService activityLogService,
                            DailyPlanningService dailyPlanningService,
                            SecurityUtils securityUtils) {
        this.timeBlockRepository = timeBlockRepository;
        this.taskRepository = taskRepository;
        this.activityLogService = activityLogService;
        this.dailyPlanningService = dailyPlanningService;
        this.securityUtils = securityUtils;
    }

    @Transactional
    public TimeBlock createTimeBlock(Long taskId, TimeBlockRequest request) {

        Long userId = securityUtils.getCurrentUserId();
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found or access denied"));

        if (request.endTime().isBefore(request.startTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        long durationMinutes = Duration.between(request.startTime(), request.endTime()).toMinutes();
        dailyPlanningService.validateDayCapacity(request.startTime().toLocalDate(), durationMinutes);

        TimeBlock timeBlock = new TimeBlock();
        timeBlock.setTask(task);
        timeBlock.setStartTime(request.startTime());
        timeBlock.setEndTime(request.endTime());

        TimeBlock saved = timeBlockRepository.save(timeBlock);

        try {
            activityLogService.log(taskId, "TIME_BLOCK_CREATED", "USER", java.util.Collections.emptyMap());
        } catch (Exception e) {
            log.warn("Issue in TimeBlockService - {}",e.getMessage());
        }

        return saved;
    }
}