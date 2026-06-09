package com.pathfinder.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResponderPreguntaRequest {
    private Integer idPreguntaDiagnostico;
    private String respuestaElegida; // "A", "B", "C" o "D"
}
