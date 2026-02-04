package com.clarity.clarity.service;

import com.clarity.clarity.dto.request.LoginRequest;
import com.clarity.clarity.dto.request.RegisterRequest;
import com.clarity.clarity.dto.response.AuthResponse;
import com.clarity.clarity.entity.User;
import com.clarity.clarity.repository.UserRepository;
import com.clarity.clarity.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        // If we get here, password is correct
        var userDetails = userDetailsService.loadUserByUsername(request.email());
        var token = jwtService.generateToken(userDetails);

        return new AuthResponse(token);
    }

    @Transactional
    public User register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setRole("USER");

        user.setPassword(passwordEncoder.encode(request.password()));

        return userRepository.save(user);
    }
}