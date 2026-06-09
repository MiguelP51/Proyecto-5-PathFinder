package com.pathfinder.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PreguntaDiagnosticoDTO {
    private Integer idPreguntaDiagnostico;
    private String enunciado;
    private String opcionA;
    private String opcionB;
    private String opcionC;
    private String opcionD;
    private Integer orden;
}
