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

    @Query("""
        SELECT t FROM Task t
        WHERE t.dueDatetime IS NOT NULL
          AND t.dueDatetime < :now
          AND t.status IN :statuses
          AND t.needsReview = false
    """)
    List<Task> findOverdueTasksForReview(
            @Param("now") LocalDateTime now,
            @Param("statuses") List<TaskStatus> statuses
    );

    List<Task> findByNeedsReviewTrue();

    List<Task> findAllByUserId(Long userId);

    Optional<Task> findByIdAndUserId(Long id, Long userId);
}
