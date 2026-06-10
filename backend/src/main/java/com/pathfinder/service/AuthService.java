package com.pathfinder.service;

import com.pathfinder.dto.auth.LoginRequestDTO;
import com.pathfinder.dto.auth.UsuarioAuthResponseDTO;

public interface AuthService {

    UsuarioAuthResponseDTO login(LoginRequestDTO request);
}