package com.clarity.clarity.repository;

import com.clarity.clarity.entity.TimeBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TimeBlockRepository extends JpaRepository<TimeBlock, Long> {

    void deleteAllByTaskId(Long taskId);

    @Query("SELECT b FROM TimeBlock b WHERE b.userId = :userId AND b.startTime >= :start AND b.startTime < :end ORDER BY b.startTime ASC")
    List<TimeBlock> findByUserIdAndDate(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("SELECT tb FROM TimeBlock tb WHERE tb.task.id = :taskId AND " +
            "(tb.startTime < :endTime AND tb.endTime > :startTime)")
    List<TimeBlock> findOverlappingBlocks(@Param("taskId") Long taskId,
                                          @Param("startTime") LocalDateTime startTime,
                                          @Param("endTime") LocalDateTime endTime);

    // 4. SECURITY: Generic single item access
    Optional<TimeBlock> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}