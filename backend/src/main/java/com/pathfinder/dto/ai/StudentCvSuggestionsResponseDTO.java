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
public class StudentCvSuggestionsResponseDTO {
    private String resumenGeneral;

    @Builder.Default
    private List<SuggestionItemDTO> sugerencias = new ArrayList<>();

    @Builder.Default
    private List<String> camposDebiles = new ArrayList<>();

    @Builder.Default
    private List<ImprovedFieldDTO> versionesMejoradas = new ArrayList<>();

    @Builder.Default
    private List<String> advertencias = new ArrayList<>();

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuggestionItemDTO {
        private String seccion;
        private String prioridad;
        private String observacion;
        private String recomendacion;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImprovedFieldDTO {
        private String campo;
        private String valorActual;
        private String sugerencia;
    }
}
