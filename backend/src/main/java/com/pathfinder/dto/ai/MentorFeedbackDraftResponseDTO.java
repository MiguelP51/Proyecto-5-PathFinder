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
public class MentorFeedbackDraftResponseDTO {
    private String resultadoSugerido;
    private String fortalezas;
    private String areasMejora;
    private String comentarios;

    @Builder.Default
    private List<String> recomendacionesSeguimiento = new ArrayList<>();

    @Builder.Default
    private List<String> advertencias = new ArrayList<>();
}
