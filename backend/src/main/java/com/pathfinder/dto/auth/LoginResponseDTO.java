package com.pathfinder.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDTO {

    private String token;
    private String tokenType;
    private UsuarioAuthResponseDTO usuario;
}