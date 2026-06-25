package com.pathfinder.dto.ai;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentCvSuggestionsRequestDTO {
    private String puestoObjetivo;
    private String tono;
    private Boolean incluirEjemplos;
}
