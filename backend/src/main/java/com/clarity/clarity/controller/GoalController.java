package com.clarity.clarity.controller;

import com.clarity.clarity.dto.request.GoalRequest;
import com.clarity.clarity.dto.response.GoalResponse;
import com.clarity.clarity.dto.response.TaskResponse;
import com.clarity.clarity.entity.Goal;
import com.clarity.clarity.entity.Task;
import com.clarity.clarity.service.GoalService;
import com.clarity.clarity.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;
    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getGoals() {
        return ResponseEntity.ok(goalService.getUserGoals());
    }

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(@RequestBody @Valid GoalRequest request) {
        Goal savedGoal = goalService.createGoal(request);
        return ResponseEntity.ok(goalService.mapToResponse(savedGoal));
    }
    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<TaskResponse>> getTasksForGoal(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTasksByGoal(id));
    }
}