package com.pathfinder.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DiagnosticoEstadoDTO {
    private Integer idDiagnostico;
    private String estado;
    private Integer puntaje;
    private Integer totalPreguntas;
    private Integer respuestasCorrectas;
    private String nivelRecomendado;
    private Boolean completado;
}