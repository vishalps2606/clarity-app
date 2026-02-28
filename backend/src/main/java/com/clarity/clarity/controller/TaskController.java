package com.clarity.clarity.controller;

import com.clarity.clarity.dto.request.ReviewRequest;
import com.clarity.clarity.dto.request.TaskRequest;
import com.clarity.clarity.dto.response.TaskResponse;
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
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final TaskReviewService taskReviewService;
    private final TimeBlockService timeBlockService;

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

    @PutMapping("/{id}/complete")
    public ResponseEntity<Void> completeTask(@PathVariable Long id) {
        taskService.completeTask(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks().stream()
                .map(taskService::mapToResponse)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.mapToResponse(taskService.getTaskById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        // Assume you add deleteTask to Service
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request
    ) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }
}