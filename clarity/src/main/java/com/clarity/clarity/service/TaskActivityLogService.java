package com.clarity.clarity.service;

import com.clarity.clarity.dto.response.TaskActivityLogResponse;
import com.clarity.clarity.entity.TaskActivityLog;
import com.clarity.clarity.repository.TaskActivityLogRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger; // Use SLF4J
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Collections;

@Service
public class TaskActivityLogService {

    private static final Logger log = LoggerFactory
            .getLogger(TaskActivityLogService.class);
    private final TaskActivityLogRepository repository;
    private final ObjectMapper objectMapper;

    public TaskActivityLogService(TaskActivityLogRepository repository,
                                  ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void log(Long taskId,
                    String action,
                    String performedBy,
                    Map<String, Object> metadata) {
        try {
            TaskActivityLog logEntry = new TaskActivityLog();
            logEntry.setTaskId(taskId);
            logEntry.setAction(action);
            logEntry.setPerformedBy(performedBy);
            logEntry.setMetadata(objectMapper.writeValueAsString(metadata));
            logEntry.setCreatedAt(LocalDateTime.now());

            repository.save(logEntry);
        } catch (Exception e) {
            // FIX: Never crash the app if logging fails
            log.error("Failed to persist activity log for task {}: {}", taskId, e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<TaskActivityLogResponse> getTaskTimeline(Long taskId) {
        return repository.findByTaskIdOrderByCreatedAtDesc(taskId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private TaskActivityLogResponse mapToResponse(TaskActivityLog logEntry) {
        Map<String, Object> metadataMap = Collections.emptyMap();
        try {
            if (logEntry.getMetadata() != null) {
                metadataMap = objectMapper.readValue(
                        logEntry.getMetadata(),
                        new TypeReference<Map<String, Object>>() {}
                );
            }
        } catch (Exception e) {
            log.warn("Failed to parse metadata for log {}: {}", logEntry.getId(), e.getMessage());
        }

        return new TaskActivityLogResponse(
                logEntry.getId(),
                logEntry.getAction(),
                logEntry.getPerformedBy(),
                metadataMap,
                logEntry.getCreatedAt()
        );
    }
}