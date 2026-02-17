package com.clarity.clarity.service;

import com.clarity.clarity.dto.request.ReminderRequest;
import com.clarity.clarity.entity.Reminder;
import com.clarity.clarity.entity.Task;
import com.clarity.clarity.domain.TaskStatus; // Import Status
import com.clarity.clarity.repository.ReminderRepository;
import com.clarity.clarity.repository.TaskRepository;
import com.clarity.clarity.util.SecurityUtils; // <--- Import
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException; // Or use IllegalArgumentException
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final TaskRepository taskRepository;
    private final TaskActivityLogService taskActivityLogService;
    private final SecurityUtils securityUtils; // <--- INJECT THIS

    @Transactional
    public void createReminder(Long taskId, ReminderRequest request) throws BadRequestException {
        Long userId = securityUtils.getCurrentUserId(); // <--- GET USER

        // FIX: Check ownership
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found or access denied"));

        if (task.getStatus() == TaskStatus.DONE || task.getStatus() == TaskStatus.SKIPPED) { // Use Enum
            throw new BadRequestException("Cannot set reminder for completed task");
        }

        if (request.remindAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reminder time must be in the future");
        }

        if (task.getDueDatetime() != null && request.remindAt().isAfter(task.getDueDatetime())) {
            throw new BadRequestException("Reminder must be before due date");
        }

        Reminder reminder = new Reminder();
        reminder.setTask(task);
        reminder.setRemindAt(request.remindAt());
        reminder.setUserId(userId);

        reminderRepository.save(reminder);

        taskActivityLogService.log(
                task.getId(),
                "REMINDER_CREATED",
                "USER",
                Map.of("remindAt", request.remindAt())
        );
    }
}