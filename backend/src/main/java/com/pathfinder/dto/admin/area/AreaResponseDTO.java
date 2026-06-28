package com.pathfinder.dto.admin.area;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AreaResponseDTO {
    private String idArea;
    private String nombre;
    private String emoji;
    private String descripcion;
    private String imagenUrl;
    private Boolean activo;
    private String tagline;
    private String funciones;
    private String colorFrom;
    private String colorTo;
}
