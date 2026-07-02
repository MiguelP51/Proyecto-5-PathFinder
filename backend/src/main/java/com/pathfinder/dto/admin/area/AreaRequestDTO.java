package com.pathfinder.dto.admin.area;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AreaRequestDTO {
    @NotBlank(message = "El nombre del área es obligatorio")
    private String nombre;

    private String emoji;
    private String descripcion;
    private String imagenUrl;
    private String tagline;
    private String funciones;
    private String colorFrom;
    private String colorTo;
}
