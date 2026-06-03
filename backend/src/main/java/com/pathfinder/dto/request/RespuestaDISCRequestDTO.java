package com.pathfinder.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RespuestaDISCRequestDTO {
    private Integer idPreguntaDisc;
    private Integer idOpcionPreguntaDisc;
    private String respuestaTexto; // Opcional para tipos de pregunta abierta
}
