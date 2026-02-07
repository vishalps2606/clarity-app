package com.clarity.clarity.service;

import com.clarity.clarity.dto.response.TaskActivityLogResponse;
import com.clarity.clarity.entity.Task;
import com.clarity.clarity.entity.TaskActivityLog;
import com.clarity.clarity.repository.TaskActivityLogRepository;
import com.clarity.clarity.repository.TaskRepository;
import com.clarity.clarity.util.SecurityUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Collections;

@Service
public class TaskActivityLogService {

    private static final Logger log = LoggerFactory.getLogger(TaskActivityLogService.class);

    private final TaskActivityLogRepository repository;
    private final TaskRepository taskRepository;
    private final ObjectMapper objectMapper;
    private final SecurityUtils securityUtils;

    public TaskActivityLogService(TaskActivityLogRepository repository,
                                  TaskRepository taskRepository,
                                  ObjectMapper objectMapper,
                                  SecurityUtils securityUtils) {
        this.repository = repository;
        this.taskRepository = taskRepository;
        this.objectMapper = objectMapper;
        this.securityUtils = securityUtils;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(Long taskId, String action, String performedBy, Map<String, Object> metadata) {
        try {
            // 1. Fetch the Task to find the Owner
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new IllegalArgumentException("Task not found for logging"));

            TaskActivityLog logEntry = new TaskActivityLog();
            logEntry.setTaskId(taskId);

            // 2. SAVE THE USER ID (This closes the loop!)
            logEntry.setUserId(task.getUserId());

            logEntry.setAction(action);
            logEntry.setPerformedBy(performedBy);
            logEntry.setMetadata(objectMapper.writeValueAsString(metadata));
            logEntry.setCreatedAt(LocalDateTime.now());

            repository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to persist activity log for task {}: {}", taskId, e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<TaskActivityLogResponse> getTaskTimeline(Long taskId) {
        Long userId = securityUtils.getCurrentUserId();

        // SECURE METHOD
        return repository.findByTaskIdAndUserIdOrderByCreatedAtDesc(taskId, userId).stream()
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