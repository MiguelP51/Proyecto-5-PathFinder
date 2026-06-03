package com.pathfinder.dto.admin.area;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SubareaResponseDTO {

    private Integer idSubarea;
    private Integer idArea;
    private String nombreArea;
    private String nombreSubarea;
    private String descripcionGeneral;
    private String imagenUrl;
    private String iconoUrl;
    private Boolean activo;
}