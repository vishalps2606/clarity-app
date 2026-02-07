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

    // 1. Get All Tasks (Secure)
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    // 2. Create Task (Secure)
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody @Valid TaskRequest request) {
        return ResponseEntity.ok(taskService.createTask(request));
    }

    // 3. Get Review List (Secure - Fixed vulnerability)
    @GetMapping("/review")
    public ResponseEntity<List<Task>> getTaskNeedingReview() {
        return ResponseEntity.ok(taskService.getTasksNeedingReview());
    }

    // 4. Submit Review
    @PostMapping("/{id}/review")
    public ResponseEntity<Void> reviewTask(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request
    ) {
        // Note: Ensure TaskReviewService also uses `findByIdAndUserId` internally!
        taskReviewService.reviewTask(id, request);
        return ResponseEntity.ok().build();
    }

    // 5. Add Time Block
    @PostMapping("/{taskId}/time-blocks")
    public ResponseEntity<Void> addTimeBlock(
            @PathVariable Long taskId,
            @Valid @RequestBody TimeBlockRequest request
    ) {
        timeBlockService.createTimeBlock(taskId, request);
        return ResponseEntity.ok().build();
    }
}