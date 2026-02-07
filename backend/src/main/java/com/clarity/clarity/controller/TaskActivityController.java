package com.clarity.clarity.controller;

import com.clarity.clarity.dto.response.TaskActivityLogResponse;
import com.clarity.clarity.service.TaskActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskActivityController {

    private final TaskActivityLogService activityLogService;

    public TaskActivityController(TaskActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping("/{taskId}/activity")
    public ResponseEntity<List<TaskActivityLogResponse>> getTaskActivity(@PathVariable Long taskId) {
        return ResponseEntity.ok(activityLogService.getTaskTimeline(taskId));
    }
}