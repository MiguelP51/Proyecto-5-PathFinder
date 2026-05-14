package com.pathfinder.dto.auth;

import com.pathfinder.model.enums.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UsuarioAuthResponseDTO {

    private Integer idUsuario;
    private String googleUid;
    private String nombreCompleto;
    private String correo;
    private String avatarUrl;
    private RolUsuario rol;
}