package com.pathfinder.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DiagnosticoResultadoDTO {
    private Integer idDiagnostico;
    private Integer puntaje;
    private Integer totalPreguntas;
    private Integer respuestasCorrectas;
    private String nivelRecomendado;
    private String estado;
}
