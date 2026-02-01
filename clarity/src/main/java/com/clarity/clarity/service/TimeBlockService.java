package com.clarity.clarity.service;

import com.clarity.clarity.entity.Task;
import com.clarity.clarity.entity.TimeBlock;
import com.clarity.clarity.dto.request.TimeBlockRequest;
import com.clarity.clarity.repository.TaskRepository;
import com.clarity.clarity.repository.TimeBlockRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TimeBlockService {

    //Note: It is a time limit, that you have every day, you can give to tasks
    //I can manage 2 hrs every day, So I have given two, can modify according to your needs
    private static final int DAILY_LIMIT_MINUTES = 2 * 60;

    private final TimeBlockRepository timeBlockRepository;
    private final TaskRepository taskRepository;
    private final TaskActivityLogService taskActivityLogService;

    @Transactional
    public void createTimeBlock(Long taskId, TimeBlockRequest request) {

        if (request.endTime().isBefore(request.startTime())) {
            throw new IllegalArgumentException("Invalid time range");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        LocalDate date = request.startTime().toLocalDate();

        long alreadyBooked =
                timeBlockRepository.totalMinutesBookedForDate(date);

        long requested =
                Duration.between(request.startTime(), request.endTime()).toMinutes();

        if (alreadyBooked + requested > DAILY_LIMIT_MINUTES) {
            throw new IllegalStateException("Day overbooked");
        }

        TimeBlock tb = new TimeBlock();
        tb.setTask(task);
        tb.setStartTime(request.startTime());
        tb.setEndTime(request.endTime());

        timeBlockRepository.save(tb);

        taskActivityLogService.log(
                task.getId(),
                "TIME_BLOCK_CREATED",
                "USER",
                Map.of(
                        "startTime", tb.getStartTime(),
                        "endTime", tb.getEndTime(),
                        "minutes", requested
                )
        );
    }
}

