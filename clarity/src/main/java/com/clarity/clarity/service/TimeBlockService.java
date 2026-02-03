package com.clarity.clarity.service;

import com.clarity.clarity.dto.request.TimeBlockRequest; // Ensure you use your Request DTO package
import com.clarity.clarity.entity.Task;
import com.clarity.clarity.entity.TimeBlock;
import com.clarity.clarity.repository.TaskRepository;
import com.clarity.clarity.repository.TimeBlockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Service
public class TimeBlockService {

    private final TimeBlockRepository timeBlockRepository;
    private final TaskRepository taskRepository;
    private final TaskActivityLogService activityLogService; // Ensure you have this from Day 11
    private final DailyPlanningService dailyPlanningService; // NEW DEPENDENCY

    // Constructor Injection
    public TimeBlockService(TimeBlockRepository timeBlockRepository,
                            TaskRepository taskRepository,
                            TaskActivityLogService activityLogService,
                            DailyPlanningService dailyPlanningService) {
        this.timeBlockRepository = timeBlockRepository;
        this.taskRepository = taskRepository;
        this.activityLogService = activityLogService;
        this.dailyPlanningService = dailyPlanningService;
    }

    @Transactional
    public TimeBlock createTimeBlock(Long taskId, TimeBlockRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // 1. Validation: End after Start
        if (request.endTime().isBefore(request.startTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // 2. Validation: Daily Capacity (The "Guard")
        long durationMinutes = Duration.between(request.startTime(), request.endTime()).toMinutes();
        dailyPlanningService.validateDayCapacity(request.startTime().toLocalDate(), durationMinutes);

        // 3. Validation: Overlap (Existing logic)
        // ... (Keep your existing overlap logic here if you have it) ...

        // 4. Save
        TimeBlock timeBlock = new TimeBlock();
        timeBlock.setTask(task);
        timeBlock.setStartTime(request.startTime());
        timeBlock.setEndTime(request.endTime());

        TimeBlock saved = timeBlockRepository.save(timeBlock);

        // 5. Log Activity
        // Use Collections.emptyMap() or Map.of() for the metadata
        try {
            activityLogService.log(taskId, "TIME_BLOCK_CREATED", "USER", java.util.Collections.emptyMap());
        } catch (Exception e) {
            // Log failure shouldn't stop flow
        }

        return saved;
    }
}