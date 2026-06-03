package com.pathfinder.dto.admin.area;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AreaResponseDTO {

    private Integer idArea;
    private String nombreArea;
    private String descripcionGeneral;
    private String imagenUrl;
    private String iconoUrl;
    private Boolean activo;
    private Integer cantidadSubareas;
    private List<SubareaResponseDTO> subareas;
}