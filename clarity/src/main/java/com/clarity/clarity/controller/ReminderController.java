package com.clarity.clarity.controller;

import com.clarity.clarity.dto.request.ReminderRequest;
import com.clarity.clarity.service.ReminderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/task")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderService reminderService;

    @PostMapping("/{taskId}/reminders")
    public ResponseEntity<Void> addReminder(
            @PathVariable Long taskId,
            @Valid @RequestBody ReminderRequest request
    ) throws BadRequestException {
        reminderService.createReminder(taskId, request);
        return ResponseEntity.ok().build();
    }
}

