package com.pathfinder.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DiagnosticoIniciadoDTO {
    private Integer idDiagnostico;
    private String estado;
    private List<PreguntaDiagnosticoDTO> preguntas;
}
