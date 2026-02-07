package com.clarity.clarity;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource; // Import this
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.flyway.enabled=false", // DISABLE FLYWAY
        "spring.jpa.hibernate.ddl-auto=create-drop", // Let Hibernate build DB
        "spring.datasource.url=jdbc:h2:mem:testdb;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "application.security.jwt.secret-key={JWT_SECRET_KEY}"
})
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testFullSecurityFlow() throws Exception {
        // ... (Keep the exact same test logic you had before) ...

        // 1. Register User A (The Victim)
        String userA = "{\"fullName\":\"User A\", \"email\":\"usera@test.com\", \"password\":\"password123\"}";
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userA))
                .andExpect(status().isOk());

        // 2. Login User A
        String loginA = "{\"email\":\"usera@test.com\", \"password\":\"password123\"}";
        MvcResult resultA = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginA))
                .andExpect(status().isOk())
                .andReturn();

        String tokenA = extractToken(resultA.getResponse().getContentAsString());

        // 3. Register User B (The Hacker)
        String userB = "{\"fullName\":\"Hacker\", \"email\":\"hacker@test.com\", \"password\":\"password123\"}";
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userB))
                .andExpect(status().isOk());

        // 4. Login User B
        String loginB = "{\"email\":\"hacker@test.com\", \"password\":\"password123\"}";
        MvcResult resultB = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginB))
                .andExpect(status().isOk())
                .andReturn();

        String tokenB = extractToken(resultB.getResponse().getContentAsString());

        // 5. User A creates a Goal
        String goalJson = "{\"title\":\"Build Clarity\", \"priority\":\"P0\"}";
        MvcResult goalResult = mockMvc.perform(post("/goals")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(goalJson))
                .andExpect(status().isOk())
                .andReturn();

        // Extract Goal ID
        String responseBody = goalResult.getResponse().getContentAsString();
        String goalId = responseBody.split("\"id\":")[1].split(",")[0];

        // 6. User A creates a Task linked to that Goal
        String taskJson = "{\"title\":\"Secure Task\", \"goalId\":" + goalId + ", \"estimatedMinutes\":60}";
        MvcResult taskResult = mockMvc.perform(post("/tasks")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskJson))
                .andExpect(status().isOk())
                .andReturn();

        String taskId = taskResult.getResponse().getContentAsString().split("\"id\":")[1].split(",")[0];

        // 7. ATTACK: User B tries to view User A's task timeline
        // Should return empty list []
        mockMvc.perform(get("/tasks/" + taskId + "/activity")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String content = result.getResponse().getContentAsString();
                    if (!content.equals("[]")) {
                        throw new AssertionError("Hacker saw activity logs! Content: " + content);
                    }
                });

        // 8. ATTACK: User B tries to create a TimeBlock on User A's task
        // Should return 404 Not Found (masked)
        String attackBlock = "{\"startTime\":\"2026-02-10T10:00:00\", \"endTime\":\"2026-02-10T11:00:00\"}";
        mockMvc.perform(post("/tasks/" + taskId + "/time-blocks")
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(attackBlock))
                .andExpect(status().isNotFound());
    }

    private String extractToken(String json) {
        return json.split("\"token\":\"")[1].split("\"")[0];
    }
}