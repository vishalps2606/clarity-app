package com.clarity.clarity.controller;

import com.clarity.clarity.dto.request.GoalRequest;
import com.clarity.clarity.entity.Goal;
import com.clarity.clarity.service.GoalService;
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

    @GetMapping
    public ResponseEntity<List<Goal>> getGoals() {
        return ResponseEntity.ok(goalService.getUserGoals());
    }

    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody @Valid GoalRequest request) {
        return ResponseEntity.ok(goalService.createGoal(request));
    }
}