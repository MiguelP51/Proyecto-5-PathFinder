package com.pathfinder.dto.admin.manage_skillpath;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateAdminManageSkillPathRequestDTO {

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotBlank(message = "La plataforma es obligatoria")
    private String plataforma;

    private String descripcion;
    private String urlExterno;
    private String dificultad;
    private String duracionLabel;
    private String areaId;
    private String areaNombre;
    private String subareaId;
    private String subareaNombre;
    private Boolean esRecomendado;
}
