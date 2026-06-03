package com.pathfinder.service;

import com.pathfinder.dto.response.DashboardResumenDTO;

public interface DashboardService {

    // Devuelve el resumen del dashboard: usuario + métricas + habilidades
    DashboardResumenDTO obtenerResumen(String correoUsuario);

    // Registra que el estudiante inició la exploración por primera vez
    void iniciarExploracion(String correoUsuario);
}
