package com.pathfinder.service;

import com.pathfinder.dto.auth.LoginRequestDTO;
import com.pathfinder.dto.auth.LoginResponseDTO;

public interface AuthService {

    LoginResponseDTO login(LoginRequestDTO request);
}