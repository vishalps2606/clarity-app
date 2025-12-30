package com.clarity.clarity.repository;

import com.clarity.clarity.domain.TaskActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskActivityLogRepository
        extends JpaRepository<TaskActivityLog, Long> {

    List<TaskActivityLog> findByTaskIdOrderByCreatedAtDesc(Long taskId);
}

