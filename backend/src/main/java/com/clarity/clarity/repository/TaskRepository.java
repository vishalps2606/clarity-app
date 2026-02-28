package com.clarity.clarity.repository;

import com.clarity.clarity.entity.Task;
import com.clarity.clarity.domain.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // --- SYSTEM QUERIES (For Schedulers) ---
    @Query("""
        SELECT t FROM Task t
        WHERE t.dueDatetime IS NOT NULL
          AND t.dueDatetime < :now
          AND t.status IN :statuses
          AND t.needsReview = false
          AND t.deleted = false
    """) // Added deleted = false check
    List<Task> findAllOverdueTasksForSystem(
            @Param("now") LocalDateTime now,
            @Param("statuses") List<TaskStatus> statuses
    );

    // --- USER QUERIES (Strictly User-Scoped & Filter Deleted) ---

    // Standard fetches
    List<Task> findAllByUserIdAndDeletedFalse(Long userId);

    Optional<Task> findByIdAndUserIdAndDeletedFalse(Long id, Long userId);

    // Filtered fetches
    List<Task> findByNeedsReviewTrueAndUserIdAndDeletedFalse(Long userId);

    List<Task> findByGoalIdAndUserIdAndDeletedFalse(Long goalId, Long userId);

    // Logic checks
    boolean existsByUserIdAndTitleAndGoalIdAndDueDatetimeAndDeletedFalse(
            Long userId, String title, Long goalId, LocalDateTime dueDatetime
    );
}