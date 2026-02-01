package com.clarity.clarity.repository;

import com.clarity.clarity.entity.TaskActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskActivityLogRepository extends JpaRepository<TaskActivityLog, Long> {
    // Fetch logs for a specific task, newest first
    List<TaskActivityLog> findByTaskIdOrderByCreatedAtDesc(Long taskId);
}