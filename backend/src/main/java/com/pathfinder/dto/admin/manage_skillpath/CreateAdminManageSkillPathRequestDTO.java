package com.pathfinder.dto.admin.manage_skillpath;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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

    @Pattern(
            regexp = "^\\d+(\\.\\d+)?\\s*(hora|horas|minuto|minutos|min|h|dia|dias|semana|semanas|mes|meses)$",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "La duracion debe tener numero y unidad. Ejemplo: 6 horas"
    )
    private String duracionLabel;

    private String areaId;
    private String areaNombre;
    private String subareaId;
    private String subareaNombre;
    private Boolean esRecomendado;
    private String estadoPublicacion; // BORRADOR, ACTIVA, INACTIVA
}
