package com.user.microservice.controller;

import com.user.microservice.entity.User;
import com.user.microservice.repository.UserRepository;
import com.user.microservice.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public UserController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // Get current user profile
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String email = jwtUtil.extractUsername(token);
            
            User user = userRepository.findByEmailId(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Don't send password to frontend
            user.setPassword(null);
            
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token or user not found");
        }
    }

    // Update user profile
    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody User updatedUser) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            
            User user = userRepository.findByEmailId(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Update allowed fields
            if (updatedUser.getFullName() != null) {
                user.setFullName(updatedUser.getFullName());
            }
            if (updatedUser.getSkills() != null) {
                user.setSkills(updatedUser.getSkills());
            }
            if (updatedUser.getResume() != null) {
                user.setResume(updatedUser.getResume());
            }
            if (updatedUser.getProfilePhoto() != null) {
                user.setProfilePhoto(updatedUser.getProfilePhoto());
            }
            
            User savedUser = userRepository.save(user);
            savedUser.setPassword(null); // Don't send password
            
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to update profile: " + e.getMessage());
        }
    }

    // Get user by ID (for other services)
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            user.setPassword(null); // Don't send password
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }
    }
}
