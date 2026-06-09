package com.pathfinder.controller;

import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.DashboardResumenDTO;
import com.pathfinder.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/estudiante/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // GET /api/estudiante/dashboard/resumen
    // Devuelve: nombre, avatar, XP, nivel, habilidades
    @GetMapping("/resumen")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<DashboardResumenDTO>> obtenerResumen(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            DashboardResumenDTO resumen = dashboardService.obtenerResumen(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Resumen obtenido", resumen));
        } catch (RuntimeException e) {
            log.error("Error obteniendo resumen del dashboard: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado en dashboard: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error obteniendo el resumen del dashboard"));
        }
    }

    // POST /api/estudiante/dashboard/exploracion/iniciar
    // Registra que el estudiante inició la exploración por primera vez
    @PostMapping("/exploracion/iniciar")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Void>> iniciarExploracion(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            dashboardService.iniciarExploracion(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Exploración iniciada", null));
        } catch (RuntimeException e) {
            log.error("Error iniciando exploración: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado iniciando exploración: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error iniciando la exploración"));
        }
    }
}
