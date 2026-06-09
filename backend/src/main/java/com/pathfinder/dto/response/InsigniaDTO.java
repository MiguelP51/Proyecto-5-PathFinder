package com.pathfinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsigniaDTO {
    private Integer idInsignia;
    private String nombre;
    private String descripcion;
    private String emoji;
    private String colorFondo;
    private String fechaObtenida;
}
