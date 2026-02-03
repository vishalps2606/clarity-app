package com.clarity.clarity.controller;

import com.clarity.clarity.dto.request.TimeBlockRequest;
import com.clarity.clarity.entity.TimeBlock;
import com.clarity.clarity.service.TimeBlockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks/{taskId}/time-blocks")
@RequiredArgsConstructor
public class TimeBlockController {

    private final TimeBlockService timeBlockService;

    @PostMapping
    public ResponseEntity<TimeBlock> createTimeBlock(
            @PathVariable Long taskId,
            @RequestBody @Valid TimeBlockRequest request
    ) {
        TimeBlock createdBlock = timeBlockService.createTimeBlock(taskId, request);
        return ResponseEntity.ok(createdBlock);
    }
}