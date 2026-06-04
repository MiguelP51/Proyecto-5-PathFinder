package com.pathfinder.dto.request;

import lombok.Data;

@Data
public class GuardarFeedbackRequest {
    private String resultado; // "Aprobado", "Requiere Mejora", "Con Observaciones"
    private String feedbackComentarios;
    private Integer competenciaComunicacion; // 1-5
    private Integer competenciaTecnica; // 1-5
    private Integer competenciaProactividad; // 1-5
    private Integer competenciaResolucion; // 1-5
}
