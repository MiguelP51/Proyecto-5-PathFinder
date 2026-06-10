package com.pathfinder.dto.cv;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ExperienciaLaboralDTO {
    private Integer id;
    private String empresa;
    private String cargo;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaInicio;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaFin;
    private String funcionesRealizadas;
    private String logrosResultados;
}
