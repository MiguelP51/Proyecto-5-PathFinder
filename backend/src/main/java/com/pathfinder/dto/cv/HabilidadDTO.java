package com.pathfinder.dto.cv;

import lombok.Data;

@Data
public class HabilidadDTO {
    private Integer id;
    private String nombre;
    private String tipo;  // BLANDA / TECNICA
    private String nivel; // NivelDominio
}
