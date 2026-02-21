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

    // --- SYSTEM QUERIES (For Schedulers ONLY) ---
    // NO userId filter here, because the System must process everyone's data.
    @Query("""
        SELECT t FROM Task t
        WHERE t.dueDatetime IS NOT NULL
          AND t.dueDatetime < :now
          AND t.status IN :statuses
          AND t.needsReview = false
    """)
    List<Task> findAllOverdueTasksForSystem(
            @Param("now") LocalDateTime now,
            @Param("statuses") List<TaskStatus> statuses
    );

    // --- USER QUERIES (For API) ---
    // STRICTLY filtered by userId.

    // For GET /tasks/review
    List<Task> findByNeedsReviewTrueAndUserId(Long userId);

    // For GET /tasks
    List<Task> findAllByUserId(Long userId);

    // For GET /tasks/{id} or updates
    Optional<Task> findByIdAndUserId(Long id, Long userId);

    // Fetch all tasks belonging to a specific goal
    List<Task> findByGoalIdAndUserId(Long goalId, Long userId);
}