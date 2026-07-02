package com.pathfinder.controller;

import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.PublicAreaResponseDTO;
import com.pathfinder.dto.response.PublicStatsDTO;
import com.pathfinder.service.PublicExplorationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/public/exploracion")
@RequiredArgsConstructor
public class PublicExplorationController {

    private final PublicExplorationService publicExplorationService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<PublicStatsDTO>> getPublicStats() {
        try {
            PublicStatsDTO stats = publicExplorationService.getPublicStats();
            return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas correctamente", stats));
        } catch (Exception e) {
            log.error("Error obteniendo estadísticas públicas: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener estadísticas"));
        }
    }

    @GetMapping("/areas")
    public ResponseEntity<ApiResponse<List<PublicAreaResponseDTO>>> getPublicAreas() {
        try {
            List<PublicAreaResponseDTO> areas = publicExplorationService.getPublicAreas();
            return ResponseEntity.ok(ApiResponse.success("Áreas públicas obtenidas correctamente", areas));
        } catch (Exception e) {
            log.error("Error obteniendo áreas públicas: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener áreas"));
        }
    }

    @GetMapping("/areas/{idArea}")
    public ResponseEntity<ApiResponse<PublicAreaResponseDTO>> getPublicAreaDetail(@PathVariable String idArea) {
        try {
            PublicAreaResponseDTO area = publicExplorationService.getPublicAreaDetail(idArea);
            return ResponseEntity.ok(ApiResponse.success("Detalle del área obtenido correctamente", area));
        } catch (Exception e) {
            log.error("Error obteniendo detalle de área pública {}: {}", idArea, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener detalle del área"));
        }
    }
}
