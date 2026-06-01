package com.pathfinder.dto.response;

import com.pathfinder.model.enums.EstadoValidacionArchivo;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ArchivoCVResponse {
    private Integer                idArchivoCv;
    private String                 nombreArchivo;
    private BigDecimal             tamanoArchivoMb;
    private EstadoValidacionArchivo estadoValidacion;
    private LocalDateTime          fechaCarga;
}
