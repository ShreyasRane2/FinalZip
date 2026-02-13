package com.profile.controller;

import com.profile.entity.EmployerProfile;
import com.profile.service.EmployerProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile/employer")
public class EmployerProfileController {

    @Autowired
    private EmployerProfileService service;

    @PostMapping
    public EmployerProfile saveProfile(@RequestBody EmployerProfile profile) {
        return service.saveProfile(profile);
    }

    @GetMapping("/{email}")
    public EmployerProfile getProfile(@PathVariable String email) {
        return service.getProfile(email).orElse(null);
    }

    @DeleteMapping("/{email}")
    public String deleteProfile(@PathVariable String email) {
        return service.deleteProfile(email) ? "Deleted" : "Not Found";
    }
    @GetMapping("/my-profile")
    public String getMyProfile() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return "Profile data for: " + email;
    }

}
