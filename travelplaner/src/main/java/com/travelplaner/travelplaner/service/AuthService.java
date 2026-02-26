package com.travelplaner.travelplaner.service;

import org.springframework.stereotype.Service;

import com.travelplaner.travelplaner.dto.RegisterRequest;
import com.travelplaner.travelplaner.model.User;
import com.travelplaner.travelplaner.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository = null;

    public String register(RegisterRequest request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return "Passwords do not match";
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "Email already exists";
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        userRepository.save(user);

        return "SUCCESS";
    }
}
