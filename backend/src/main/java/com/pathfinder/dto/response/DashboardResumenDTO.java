package com.pathfinder.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DashboardResumenDTO {

    // Datos del usuario
    private String nombre;
    private String avatar;
    private String correo;

    // Métricas de entrenamiento
    private Integer xpTotal;
    private Integer nivel;
    private Integer xpSiguienteNivel;
    private Boolean exploracionIniciada;

    // Habilidades del CV (reutilizadas para el dashboard)
    private List<HabilidadDashboardDTO> habilidades;

    @Getter
    @Builder
    public static class HabilidadDashboardDTO {
        private String nombre;
        private String tipo;    // TECNICA o BLANDA
        private String nivel;   // BASICO, INTERMEDIO, AVANZADO
    }
}
