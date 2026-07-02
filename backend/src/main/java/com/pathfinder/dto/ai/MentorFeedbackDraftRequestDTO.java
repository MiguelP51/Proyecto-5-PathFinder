package com.pathfinder.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorFeedbackDraftRequestDTO {
    private String resultadoActual;
    private String fortalezasActuales;
    private String areasMejoraActuales;
    private String comentariosActuales;

    @Builder.Default
    private List<CompetenciaEvaluadaDTO> competenciasEvaluadas = new ArrayList<>();

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompetenciaEvaluadaDTO {
        private String nombreCompetencia;
        private Integer nivelSeleccionado;
        private String descripcionNivel;
    }
}
