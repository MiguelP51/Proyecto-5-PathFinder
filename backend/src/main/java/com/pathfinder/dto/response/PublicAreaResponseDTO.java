package com.pathfinder.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class PublicAreaResponseDTO {
    private String idArea;
    private String nombre;
    private String emoji;
    private String descripcion;
    private String imagenUrl;
    private String tagline;
    private String funciones;
    private String colorFrom;
    private String colorTo;
    private List<PublicSubAreaResponseDTO> subareas;
}
