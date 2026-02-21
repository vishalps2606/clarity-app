package com.clarity.clarity.controller;

import com.clarity.clarity.dto.request.GoalRequest;
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
    public ResponseEntity<List<Goal>> getGoals() {
        return ResponseEntity.ok(goalService.getUserGoals());
    }

    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody @Valid GoalRequest request) {
        return ResponseEntity.ok(goalService.createGoal(request));
    }

    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<Task>> getTasksForGoal(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTasksByGoal(id));
    }
}