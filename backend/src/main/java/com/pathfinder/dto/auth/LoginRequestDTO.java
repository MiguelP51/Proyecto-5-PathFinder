package com.pathfinder.dto.auth;

import lombok.Data;

@Data
public class LoginRequestDTO {

    private String googleUid;
    private String correo;
    private String nombreCompleto;
    private String avatarUrl;
}