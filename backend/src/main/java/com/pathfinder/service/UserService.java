package com.pathfinder.service;

import com.pathfinder.model.User;

import java.util.Optional;

public interface UserService {
    Optional<User> findByEmail(String email);
    User getCurrentUser(String email);
}
