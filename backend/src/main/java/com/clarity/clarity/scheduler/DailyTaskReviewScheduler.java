package com.clarity.clarity.scheduler;

import com.clarity.clarity.service.TaskReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DailyTaskReviewScheduler {

    private final TaskReviewService taskReviewService;

    @Scheduled(cron = "0 0 0 * * ?")
    public void runDailyReview() {
        taskReviewService.reviewOverdueTasks();
    }
}
