package com.pathfinder.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class GuardarFeedbackRequest {
    private String resultado; // "Alta", "Media", "Baja" (Probabilidad de éxito)
    private String feedbackComentarios;
    private Integer competenciaComunicacion; // 1-5 (Legacy)
    private Integer competenciaTecnica; // 1-5 (Legacy)
    private Integer competenciaProactividad; // 1-5 (Legacy)
    private Integer competenciaResolucion; // 1-5 (Legacy)
    private List<CompetenciaEvaluadaDTO> competenciasEvaluadas;

    @Data
    public static class CompetenciaEvaluadaDTO {
        private String nombreCompetencia;
        private Integer nivelSeleccionado; // 0, 1, 2, 3
        private String descripcionNivel;
    }
}
