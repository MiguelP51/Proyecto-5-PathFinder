package com.pathfinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * HU-EST-33: resumen consolidado de "Mi Progreso" del estudiante.
 * Combina PerfilEntrenamiento (XP/nivel) + Insignia (vitrina).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MiProgresoResponseDTO {

    private Integer xpTotal;
    private Integer nivel;
    private Integer xpSiguienteNivel;

    // XP que falta para el siguiente nivel (xpSiguienteNivel - xpTotal),
    // útil para que el frontend pinte la barra de progreso sin recalcular.
    private Integer xpFaltanteSiguienteNivel;

    // true si el estudiante todavía no tiene XP ni insignias (estado vacío).
    private Boolean esNuevo;

    private List<InsigniaDTO> insignias;
}
