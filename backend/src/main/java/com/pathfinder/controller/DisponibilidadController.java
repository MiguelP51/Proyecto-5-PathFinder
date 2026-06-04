package com.pathfinder.controller;

import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.DisponibilidadDTO;
import com.pathfinder.dto.response.MentorDisponibilidadDTO;
import com.pathfinder.dto.response.MentorDisponibilidadCompletaDTO;
import com.pathfinder.service.DisponibilidadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/disponibilidad")
@RequiredArgsConstructor
public class DisponibilidadController {

    private final DisponibilidadService disponibilidadService;

    // GET /api/disponibilidad/mentor — Obtener disponibilidad completa del mentor (HU-PM-02)
    @GetMapping("/mentor")
    public ResponseEntity<ApiResponse<MentorDisponibilidadCompletaDTO>> getMentorAvailability(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            MentorDisponibilidadCompletaDTO completa = disponibilidadService.obtenerDisponibilidadCompleta(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Disponibilidad obtenida con éxito", completa));
        } catch (Exception e) {
            log.error("Error obteniendo disponibilidad del mentor: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al obtener disponibilidad"));
        }
    }

    // POST /api/disponibilidad/mentor — Guardar/actualizar configuración y bloques de disponibilidad (HU-PM-02)
    @PostMapping("/mentor")
    public ResponseEntity<ApiResponse<Void>> saveMentorAvailability(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody MentorDisponibilidadCompletaDTO dto) {
        try {
            disponibilidadService.guardarDisponibilidadCompleta(userDetails.getUsername(), dto);
            return ResponseEntity.ok(ApiResponse.success("Disponibilidad guardada correctamente", null));
        } catch (Exception e) {
            log.error("Error guardando disponibilidad del mentor: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al guardar disponibilidad: " + e.getMessage()));
        }
    }

    // DELETE /api/disponibilidad/mentor/{id} — Eliminar bloque de disponibilidad (HU-PM-02)
    @DeleteMapping("/mentor/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAvailability(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer id) {
        try {
            disponibilidadService.eliminarDisponibilidad(id, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Bloque eliminado correctamente", null));
        } catch (Exception e) {
            log.error("Error eliminando bloque de disponibilidad: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al eliminar disponibilidad: " + e.getMessage()));
        }
    }

    // GET /api/disponibilidad/estudiante/mentores — Listar mentores disponibles (HU-EST-14)
    @GetMapping("/estudiante/mentores")
    public ResponseEntity<ApiResponse<List<MentorDisponibilidadDTO>>> getMentoresDisponibles() {
        try {
            List<MentorDisponibilidadDTO> mentores = disponibilidadService.obtenerMentoresDisponibles();
            return ResponseEntity.ok(ApiResponse.success("Mentores obtenidos con éxito", mentores));
        } catch (Exception e) {
            log.error("Error obteniendo mentores disponibles: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al obtener mentores"));
        }
    }

    // GET /api/disponibilidad/estudiante/mentores/{id}/slots — Obtener slots libres de un mentor en fecha dada (HU-EST-14)
    @GetMapping("/estudiante/mentores/{id}/slots")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableSlots(
            @PathVariable Integer id,
            @RequestParam String fecha) {
        try {
            List<String> slots = disponibilidadService.obtenerSlotsDisponibles(id, fecha);
            return ResponseEntity.ok(ApiResponse.success("Slots de tiempo obtenidos con éxito", slots));
        } catch (Exception e) {
            log.error("Error obteniendo slots de tiempo para mentor ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al obtener slots: " + e.getMessage()));
        }
    }
}
