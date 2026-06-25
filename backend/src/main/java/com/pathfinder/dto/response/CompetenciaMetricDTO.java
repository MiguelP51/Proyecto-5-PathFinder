package com.pathfinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompetenciaMetricDTO {
    private String nombre;
    private int totalEvaluaciones;
    private double puntajePromedio;
}
