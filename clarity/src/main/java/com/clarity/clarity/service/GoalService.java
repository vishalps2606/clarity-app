package com.clarity.clarity.service;

import com.clarity.clarity.domain.GoalStatus;
import com.clarity.clarity.dto.request.GoalRequest;
import com.clarity.clarity.entity.Goal;
import com.clarity.clarity.repository.GoalRepository;
import com.clarity.clarity.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final SecurityUtils securityUtils;

    @Transactional
    public Goal createGoal(GoalRequest request) {
        Long userId = securityUtils.getCurrentUserId();

        Goal goal = new Goal();
        goal.setUserId(userId);
        goal.setTitle(request.title());
        goal.setPriority(request.priority());
        goal.setStatus(GoalStatus.ACTIVE);

        return goalRepository.save(goal);
    }

    public List<Goal> getUserGoals() {
        return goalRepository.findAllByUserId(securityUtils.getCurrentUserId());
    }
}