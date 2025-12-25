package com.clarity.clarity.controller;

import com.clarity.clarity.service.TaskReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/debug")
@RequiredArgsConstructor
public class TaskTestController {

    private final TaskReviewService taskReviewService;

    @PostMapping("/review-overdue")
    public String reviewOverdueTasks() {
        taskReviewService.reviewOverdueTasks();
        return "Triggered";
    }
}

