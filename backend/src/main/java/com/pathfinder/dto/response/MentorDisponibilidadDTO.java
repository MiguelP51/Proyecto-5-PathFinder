package com.pathfinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorDisponibilidadDTO {
    private Integer idUsuario;
    private String nombreCompleto;
    private String correo;
    private String avatarUrl;
    private String linkedinUrl;
    private String perfilProfesional;
    private String celular;
    private String correoContacto;
}
