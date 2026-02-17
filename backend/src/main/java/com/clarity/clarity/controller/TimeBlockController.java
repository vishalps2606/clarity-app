package com.clarity.clarity.controller;

import com.clarity.clarity.dto.request.TimeBlockRequest;
import com.clarity.clarity.entity.TimeBlock;
import com.clarity.clarity.service.TimeBlockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/time-blocks") // MOVED TO ROOT
@RequiredArgsConstructor
public class TimeBlockController {

    private final TimeBlockService timeBlockService;

    // 1. Get Schedule (Daily View)
    @GetMapping
    public ResponseEntity<List<TimeBlock>> getBlocks(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(timeBlockService.getBlocksForDay(targetDate));
    }

    // 2. Create Block (Now accepts taskId in body via DTO)
    @PostMapping
    public ResponseEntity<TimeBlock> createBlock(@Valid @RequestBody TimeBlockRequest request) {
        // We pass the whole request. Service must extract taskId from it.
        return ResponseEntity.ok(timeBlockService.createTimeBlock(request));
    }

    // 3. Delete Block
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlock(@PathVariable Long id) {
        timeBlockService.deleteBlock(id);
        return ResponseEntity.noContent().build();
    }
}