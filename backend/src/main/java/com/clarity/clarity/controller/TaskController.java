package com.clarity.clarity.controller;

import com.clarity.clarity.dto.request.ReviewRequest;
import com.clarity.clarity.dto.request.TaskRequest;
import com.clarity.clarity.dto.request.TimeBlockRequest;
import com.clarity.clarity.entity.Task;
import com.clarity.clarity.service.TaskReviewService;
import com.clarity.clarity.service.TaskService;
import com.clarity.clarity.service.TimeBlockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks") // Standardized to plural
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final TaskReviewService taskReviewService;
    private final TimeBlockService timeBlockService;

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody @Valid TaskRequest request) {
        return ResponseEntity.ok(taskService.createTask(request));
    }

    @GetMapping("/review")
    public ResponseEntity<List<Task>> getTaskNeedingReview() {
        return ResponseEntity.ok(taskService.getTasksNeedingReview());
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<Void> reviewTask(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request
    ) {
        taskReviewService.reviewTask(id, request);
        return ResponseEntity.ok().build();
    }
}