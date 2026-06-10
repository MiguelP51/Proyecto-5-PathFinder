package com.pathfinder.dto.cv;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;

@Data
public class FormacionAcademicaDTO {
    private Integer id;
    private String institucion;
    private String carrera;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaInicio;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaFin;
    private String cursosRelevantes;
}
