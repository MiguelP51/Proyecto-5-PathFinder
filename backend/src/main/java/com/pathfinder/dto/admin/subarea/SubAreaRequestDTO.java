package com.pathfinder.dto.admin.subarea;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubAreaRequestDTO {
    @NotBlank(message = "El ID del área asociada es obligatorio")
    private String areaId;

    @NotBlank(message = "El nombre de la subárea es obligatorio")
    private String nombre;

    private String emoji;
    private String descripcion;
    private String objetivos;
    private String habilidadesRelacionadas;
    private String nivel; // Principiante, Intermedio, Avanzado
    private String plataformasSkillPath;
    private String slug;
}
