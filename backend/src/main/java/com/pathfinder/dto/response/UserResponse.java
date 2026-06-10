package com.pathfinder.dto.response;

import com.pathfinder.model.entity.Usuario;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponse {
    private Integer id;
    private String email;
    private String name;
    private String pictureUrl;
    private String role;

    public static UserResponse from(Usuario usuario) {
        return UserResponse.builder()
                .id(usuario.getIdUsuario())
                .email(usuario.getCorreo())
                .name(usuario.getNombreCompleto())
                .pictureUrl(usuario.getAvatarUrl())
                .role(usuario.getRol() != null ? usuario.getRol().name() : null)
                .build();
    }
}