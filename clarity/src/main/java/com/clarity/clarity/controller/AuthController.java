package com.clarity.clarity.controller;

import com.clarity.clarity.dto.request.LoginRequest;
import com.clarity.clarity.dto.request.RegisterRequest;
import com.clarity.clarity.dto.response.AuthResponse;
import com.clarity.clarity.entity.User;
import com.clarity.clarity.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody @Valid RegisterRequest request) {
        // Note: In Day 15, we will return a JWT Token here instead of the User object
        User createdUser = authService.register(request);
        return ResponseEntity.ok(createdUser);
    }
}