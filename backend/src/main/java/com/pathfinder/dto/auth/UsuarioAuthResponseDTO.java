package com.pathfinder.dto.auth;

import com.pathfinder.model.enums.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UsuarioAuthResponseDTO {

    private Integer idUsuario;
    private String correo;
    private String nombreCompleto;
    private String avatarUrl;
    private RolUsuario rol;

    private boolean nuevoUsuario;
    private boolean requiereCompletarPerfil;
}