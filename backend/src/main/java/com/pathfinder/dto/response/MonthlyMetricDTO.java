package com.pathfinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyMetricDTO {
    private int mes;
    private int anio;
    private String nombreMes;
    private int entrevistas;
    private int tiempoPromedio;
    private double calificacionPromedio;
}
