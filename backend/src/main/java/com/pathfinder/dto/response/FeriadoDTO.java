package com.pathfinder.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FeriadoDTO {
    private String fecha;
    private String descripcion;
}
