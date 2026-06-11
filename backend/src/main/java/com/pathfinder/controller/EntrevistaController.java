package com.pathfinder.controller;

import com.pathfinder.dto.request.AgendarEntrevistaRequest;
import com.pathfinder.dto.request.GuardarFeedbackRequest;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.EntrevistaResponseDTO;
import com.pathfinder.service.EntrevistaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/entrevistas")
@RequiredArgsConstructor
public class EntrevistaController {

    private final EntrevistaService entrevistaService;

    // POST /api/entrevistas/agendar — Agendar entrevista por estudiante (HU-EST-14)
    @PostMapping("/agendar")
    public ResponseEntity<ApiResponse<EntrevistaResponseDTO>> agendar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody AgendarEntrevistaRequest request) {
        try {
            EntrevistaResponseDTO dto = entrevistaService.agendarEntrevista(userDetails.getUsername(), request);
            String message = Boolean.FALSE.equals(dto.getEmailEnviado())
                    ? "Entrevista agendada correctamente, pero hubo un inconveniente al enviar la confirmación por correo."
                    : "Entrevista agendada correctamente";
            return ResponseEntity.ok(ApiResponse.success(message, dto));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error agendando entrevista: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al agendar entrevista: " + e.getMessage()));
        }
    }

    // POST /api/entrevistas/cancelar — Cancelar/Reagendar entrevista activa por el estudiante con motivo
    @PostMapping("/cancelar")
    public ResponseEntity<ApiResponse<Void>> cancelar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody java.util.Map<String, Object> body) {
        try {
            String motivo = (String) body.getOrDefault("motivo", "No especificado");
            Boolean esReagendado = (Boolean) body.getOrDefault("esReagendado", false);
            entrevistaService.cancelarOReagendarEntrevistaEstudiante(userDetails.getUsername(), motivo, esReagendado);
            return ResponseEntity.ok(ApiResponse.success("Entrevista procesada correctamente", null));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error cancelando/reagendando entrevista: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al procesar cancelación/reagendamiento: " + e.getMessage()));
        }
    }

    // GET /api/entrevistas/estudiante — Obtener entrevista activa del estudiante (HU-EST-15 / HU-EST-16)
    @GetMapping("/estudiante")
    public ResponseEntity<ApiResponse<EntrevistaResponseDTO>> getEstudianteInterview(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            EntrevistaResponseDTO dto = entrevistaService.obtenerEntrevistaActivaEstudiante(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Entrevista obtenida con éxito", dto));
        } catch (IllegalArgumentException e) {
            // Devuelve éxito con null si no tiene entrevista, o error controlado
            return ResponseEntity.ok(ApiResponse.success("Sin entrevistas registradas", null));
        } catch (Exception e) {
            log.error("Error obteniendo entrevista del estudiante: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al obtener detalles de la entrevista"));
        }
    }

    // GET /api/entrevistas/mentor — Obtener lista de entrevistas del mentor logueado (HU-PM-03)
    @GetMapping("/mentor")
    public ResponseEntity<ApiResponse<List<EntrevistaResponseDTO>>> getMentorInterviews(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<EntrevistaResponseDTO> lista = entrevistaService.obtenerEntrevistasMentor(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Entrevistas obtenidas con éxito", lista));
        } catch (Exception e) {
            log.error("Error obteniendo entrevistas del mentor: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al obtener la lista de entrevistas"));
        }
    }

    // PUT /api/entrevistas/{id}/enlace — Registrar/actualizar enlace virtual por el mentor (HU-PM-04)
    @PutMapping("/{id}/enlace")
    public ResponseEntity<ApiResponse<Void>> saveVirtualLink(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        try {
            String link = body.get("virtualLink");
            if (link == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("El enlace virtualLink es requerido"));
            }
            boolean emailSent = entrevistaService.guardarEnlaceVirtual(id, userDetails.getUsername(), link.trim());
            String message = emailSent
                    ? "Enlace virtual registrado con éxito"
                    : "Enlace virtual registrado con éxito, pero falló el envío del correo de notificación";
            return ResponseEntity.ok(ApiResponse.success(message, null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error guardando enlace virtual: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al guardar el enlace: " + e.getMessage()));
        }
    }

    // POST /api/entrevistas/{id}/feedback — Registrar feedback y evaluación (HU-PM-06)
    @PostMapping("/{id}/feedback")
    public ResponseEntity<ApiResponse<Void>> submitFeedback(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer id,
            @RequestBody GuardarFeedbackRequest req) {
        try {
            entrevistaService.guardarFeedback(
                    id, 
                    userDetails.getUsername(), 
                    req.getResultado(), 
                    req.getFeedbackComentarios(),
                    req.getCompetenciaComunicacion(),
                    req.getCompetenciaTecnica(),
                    req.getCompetenciaProactividad(),
                    req.getCompetenciaResolucion()
            );
            return ResponseEntity.ok(ApiResponse.success("Feedback registrado con éxito", null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error guardando feedback de entrevista: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al registrar el feedback: " + e.getMessage()));
        }
    }
}
