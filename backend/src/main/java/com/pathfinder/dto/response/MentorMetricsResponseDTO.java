package com.pathfinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorMetricsResponseDTO {
    private int entrevistasRealizadas;
    private int entrevistasPendientes;
    private Integer tiempoPromedioMinutos;
    private Double calificacionPromedio;
    private List<MonthlyMetricDTO> desempenioMensual;
    private List<CompetenciaMetricDTO> evaluacionCompetencias;
    private List<FeedbackRecentDTO> evaluacionesRecientes;
    private int totalEntrevistas;
    private Double tasaAprobacion;
    private Double calificacionGlobal;
}
