package com.clarity.clarity.repository;

import com.clarity.clarity.entity.TaskActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface TaskActivityLogRepository extends JpaRepository<TaskActivityLog, Long> {
    List<TaskActivityLog> findByTaskIdOrderByCreatedAtDesc(Long taskId);

    List<TaskActivityLog> findByCreatedAtAfter(LocalDateTime date);
}