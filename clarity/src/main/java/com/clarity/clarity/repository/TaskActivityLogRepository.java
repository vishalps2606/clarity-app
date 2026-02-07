package com.clarity.clarity.repository;

import com.clarity.clarity.entity.TaskActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface TaskActivityLogRepository extends JpaRepository<TaskActivityLog, Long> {

    // 1. For Timeline (Secure)
    List<TaskActivityLog> findByTaskIdAndUserIdOrderByCreatedAtDesc(Long taskId, Long userId);

    // 2. For Insights (Secure)
    List<TaskActivityLog> findByCreatedAtAfterAndUserId(LocalDateTime date, Long userId);
}