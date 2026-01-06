package com.clarity.clarity.service;

import com.clarity.clarity.entity.TaskActivityLog;
import com.clarity.clarity.repository.TaskActivityLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class TaskActivityLogService {

    private final TaskActivityLogRepository repository;
    private final ObjectMapper objectMapper;

    public TaskActivityLogService(TaskActivityLogRepository repository,
                                  ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public void log(
            Long taskId,
            String action,
            String performedBy,
            Map<String, Object> metadata
    ) {
        TaskActivityLog log = new TaskActivityLog();
        log.setTaskId(taskId);
        log.setAction(action);
        log.setPerformedBy(performedBy);
        log.setMetadata(convert(metadata));
        log.setCreatedAt(LocalDateTime.now());

        repository.save(log);
    }

    private String convert(Map<String, Object> metadata) {
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize metadata");
        }
    }
}
