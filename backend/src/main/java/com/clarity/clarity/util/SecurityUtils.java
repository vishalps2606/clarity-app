package com.clarity.clarity.util;

import com.clarity.clarity.entity.User;
import com.clarity.clarity.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    private final UserRepository userRepository;

    public SecurityUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }

        String email = authentication.getName(); // JWT Subject is email
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found in database"));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}