package com.profile.service;

import com.profile.entity.EmployerProfile;
import com.profile.Repository.EmployerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EmployerProfileService {

    @Autowired
    private EmployerProfileRepository repo;

    public EmployerProfile saveProfile(EmployerProfile profile) {
        return repo.save(profile);
    }

    public Optional<EmployerProfile> getProfile(String email) {
        return repo.findByEmail(email);
    }

    public boolean deleteProfile(String email) {
        Optional<EmployerProfile> profileOpt = repo.findByEmail(email);
        profileOpt.ifPresent(repo::delete);
        return profileOpt.isPresent();
    }
}
