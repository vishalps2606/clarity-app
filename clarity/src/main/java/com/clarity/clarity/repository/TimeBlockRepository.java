package com.clarity.clarity.repository;

import com.clarity.clarity.entity.TimeBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TimeBlockRepository extends JpaRepository<TimeBlock, Long> {
    List<TimeBlock> findByTaskId(Long taskId);

    // New: Find all blocks overlapping a specific window (Task overlap check)
    @Query("SELECT tb FROM TimeBlock tb WHERE tb.task.id = :taskId AND " +
            "(tb.startTime < :endTime AND tb.endTime > :startTime)")
    List<TimeBlock> findOverlappingBlocks(@Param("taskId") Long taskId,
                                          @Param("startTime") LocalDateTime startTime,
                                          @Param("endTime") LocalDateTime endTime);

    // New: Find all blocks for ANY task on a specific day (Daily Capacity check)
    List<TimeBlock> findByStartTimeBetween(LocalDateTime startOfDay, LocalDateTime endOfDay);
}