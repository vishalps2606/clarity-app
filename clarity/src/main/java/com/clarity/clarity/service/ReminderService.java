package com.clarity.clarity.service;

import com.clarity.clarity.entity.Reminder;
import com.clarity.clarity.entity.Task;
import com.clarity.clarity.dto.ReminderRequest;
import com.clarity.clarity.repository.ReminderRepository;
import com.clarity.clarity.repository.TaskRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import static com.clarity.clarity.domain.TaskStatus.DONE;
import static com.clarity.clarity.domain.TaskStatus.SKIPPED;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final TaskRepository taskRepository;
    private final TaskActivityLogService taskActivityLogService;

    @Transactional
    public void createReminder(Long taskId, ReminderRequest request) throws BadRequestException {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        if (task.getStatus() == DONE || task.getStatus() == SKIPPED) {
            throw new BadRequestException("Cannot set reminder for completed task");
        }

        if (request.remindAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reminder time must be in the future");
        }

        if (task.getDueDatetime() != null &&
                request.remindAt().isAfter(task.getDueDatetime())) {
            throw new BadRequestException("Reminder must be before due date");
        }

        Reminder reminder = new Reminder();
        reminder.setTask(task);
        reminder.setRemindAt(request.remindAt());

        reminderRepository.save(reminder);

        taskActivityLogService.log(
                task.getId(),
                "REMINDER_CREATED",
                "USER",
                Map.of(
                        "remindAt", request.remindAt()
                )
        );
    }
}

