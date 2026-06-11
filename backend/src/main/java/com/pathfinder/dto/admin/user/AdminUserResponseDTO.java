package com.pathfinder.dto.admin.user;

import com.pathfinder.model.entity.Usuario;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminUserResponseDTO {

    private Integer idUsuario;
    private String correo;
    private String nombreCompleto;
    private String avatarUrl;
    private String rol;
    private Boolean activo;
    private Boolean nuevoUsuario;
    private LocalDateTime fechaRegistro;

    public static AdminUserResponseDTO from(Usuario usuario) {
        return AdminUserResponseDTO.builder()
                .idUsuario(usuario.getIdUsuario())
                .correo(usuario.getCorreo())
                .nombreCompleto(usuario.getNombreCompleto())
                .avatarUrl(usuario.getAvatarUrl())
                .rol(usuario.getRol() != null ? usuario.getRol().name() : null)
                .activo(usuario.getActivo())
                .nuevoUsuario(usuario.getNuevoUsuario())
                .fechaRegistro(usuario.getFechaRegistro())
                .build();
    }
}