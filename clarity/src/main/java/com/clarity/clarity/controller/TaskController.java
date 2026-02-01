package com.clarity.clarity.controller;

import com.clarity.clarity.entity.Task;
import com.clarity.clarity.dto.request.ReviewRequest;
import com.clarity.clarity.dto.request.TimeBlockRequest;
import com.clarity.clarity.repository.TaskRepository;
import com.clarity.clarity.service.TaskReviewService;
import com.clarity.clarity.service.TimeBlockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/task")
@RequiredArgsConstructor
public class TaskController {

    private TaskRepository taskRepository;
    private final TaskReviewService taskReviewService;
    private final TimeBlockService timeBlockService;

//    @PatchMapping("/tasks/{id}/status")
//    public void updateStatus(
//            @PathVariable Long id,
//            @RequestBody TaskStatusUpdateRequest request
//    ) {
//        taskService.updateStatus(id, request.getStatus());
//    }

    @GetMapping("/review")
    public List<Task> getTaskNeedingReview() {
        return taskRepository.findByNeedsReviewTrue();
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<Void> reviewTask(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request
    ) {
        taskReviewService.reviewTask(id, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{taskId}/time-blocks")
    public ResponseEntity<Void> addTimeBlock(
            @PathVariable Long taskId,
            @Valid @RequestBody TimeBlockRequest request
    ) {
        timeBlockService.createTimeBlock(taskId, request);
        return ResponseEntity.ok().build();
    }
}
