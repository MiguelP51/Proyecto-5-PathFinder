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
public class MentorInterviewRecommendationsResponseDTO {
    private String resumenEstudiante;

    @Builder.Default
    private List<String> tipsCv = new ArrayList<>();

    @Builder.Default
    private List<SkillPathRecommendationDTO> skillpathsRecomendados = new ArrayList<>();

    @Builder.Default
    private List<QuestionRecommendationDTO> preguntasSugeridas = new ArrayList<>();

    @Builder.Default
    private List<String> puntosAValidar = new ArrayList<>();

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillPathRecommendationDTO {
        private Integer idSkillPath;
        private String titulo;
        private String prioridad;
        private String motivo;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionRecommendationDTO {
        private String tipo;
        private String pregunta;
        private String objetivo;
    }
}
