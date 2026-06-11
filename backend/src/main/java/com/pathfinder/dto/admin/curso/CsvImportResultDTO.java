package com.pathfinder.dto.admin.curso;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CsvImportResultDTO {
    private int totalProcesados;
    private int cursosInsertados;
    private int cursosActualizados;
    private int errores;
    private String mensaje;
}
