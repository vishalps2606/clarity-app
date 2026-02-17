package com.clarity.clarity.service;

import com.clarity.clarity.entity.TimeBlock;
import com.clarity.clarity.repository.TimeBlockRepository;
import com.clarity.clarity.util.SecurityUtils; // <--- Import This
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DailyPlanningService {

    private final TimeBlockRepository timeBlockRepository;
    private final SecurityUtils securityUtils; // <--- Inject This

    // HARD LIMIT: 4 Hours (240 minutes).
    private static final long DAILY_CAPACITY_MINUTES = 240;

    @Transactional(readOnly = true)
    public void validateDayCapacity(LocalDate date, long newBlockMinutes) {
        Long userId = securityUtils.getCurrentUserId(); // <--- Get User ID

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();

        // FIX: Use the SECURE method (User ID + Date)
        List<TimeBlock> dailyBlocks = timeBlockRepository.findByUserIdAndDate(userId, startOfDay, endOfDay);

        long currentPlannedMinutes = dailyBlocks.stream()
                .mapToLong(block -> java.time.Duration.between(block.getStartTime(), block.getEndTime()).toMinutes())
                .sum();

        if (currentPlannedMinutes + newBlockMinutes > DAILY_CAPACITY_MINUTES) {
            long remaining = Math.max(0, DAILY_CAPACITY_MINUTES - currentPlannedMinutes);
            throw new IllegalArgumentException(
                    String.format("Daily Capacity Exceeded! You have planned %d mins. Limit is %d. Remaining: %d mins.",
                            currentPlannedMinutes, DAILY_CAPACITY_MINUTES, remaining)
            );
        }
    }
}