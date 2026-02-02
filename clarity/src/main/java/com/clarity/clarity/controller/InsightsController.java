package com.clarity.clarity.controller;

import com.clarity.clarity.dto.response.PlanningInsightsResponse;
import com.clarity.clarity.service.PlanningInsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/insights")
@RequiredArgsConstructor
public class InsightsController {

    private final PlanningInsightsService insightsService;

    @GetMapping("/weekly")
    public ResponseEntity<PlanningInsightsResponse> getWeeklyInsights() {
        return ResponseEntity.ok(insightsService.getWeeklyInsights());
    }
}