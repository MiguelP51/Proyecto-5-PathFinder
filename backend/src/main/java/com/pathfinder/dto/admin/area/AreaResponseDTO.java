package com.pathfinder.dto.admin.area;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AreaResponseDTO {
    private String idArea;
    private String nombre;
    private String emoji;
    private Boolean activo;
}
