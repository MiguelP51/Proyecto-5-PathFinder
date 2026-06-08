package com.pathfinder.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SubAreaResponseDTO {
    private Integer idSubarea;
    private String areaId;
    private String areaNombre;
    private String nombre;
    private String descripcion;
    private String objetivos;
    private String habilidadesRelacionadas;
    private Boolean yaVisitada;
}