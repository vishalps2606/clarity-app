package com.clarity.clarity.controller;

import com.clarity.clarity.domain.Task;
import com.clarity.clarity.dto.ReviewRequest;
import com.clarity.clarity.dto.TaskStatusUpdateRequest;
import com.clarity.clarity.repository.TaskRepository;
import com.clarity.clarity.service.TaskReviewService;
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
}
