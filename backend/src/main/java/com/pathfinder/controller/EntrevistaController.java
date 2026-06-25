package com.pathfinder.controller;

import com.pathfinder.dto.request.AgendarEntrevistaRequest;
import com.pathfinder.dto.request.GuardarFeedbackRequest;
import com.pathfinder.dto.request.ReprogramarEntrevistaRequest;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.EntrevistaResponseDTO;
import com.pathfinder.dto.response.MentorMetricsResponseDTO;
import com.pathfinder.model.entity.Competencia;
import com.pathfinder.repository.CompetenciaRepository;
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
    private final CompetenciaRepository competenciaRepository;

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

    // PUT /api/entrevistas/{id}/reprogramar — Reprogramar entrevista por el mentor (solo si no ha evaluado)
    @PutMapping("/{id}/reprogramar")
    public ResponseEntity<ApiResponse<EntrevistaResponseDTO>> reprogramar(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer id,
            @RequestBody ReprogramarEntrevistaRequest request) {
        try {
            EntrevistaResponseDTO dto = entrevistaService.reprogramar(id, userDetails.getUsername(), request);
            return ResponseEntity.ok(ApiResponse.success("Entrevista reprogramada exitosamente", dto));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error reprogramando entrevista: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al reprogramar entrevista: " + e.getMessage()));
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

    // GET /api/entrevistas/estudiante/historial — Obtener historial de entrevistas (activas e inactivas) del estudiante
    @GetMapping("/estudiante/historial")
    public ResponseEntity<ApiResponse<List<EntrevistaResponseDTO>>> getEstudianteInterviewHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<EntrevistaResponseDTO> historial = entrevistaService.obtenerHistorialEstudiante(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Historial de entrevistas obtenido con éxito", historial));
        } catch (Exception e) {
            log.error("Error obteniendo historial de entrevistas del estudiante: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al obtener el historial de entrevistas"));
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

    // GET /api/entrevistas/mentor/metrics — Obtener metricas del mentor (HU-PM-XX)
    @GetMapping("/mentor/metrics")
    public ResponseEntity<ApiResponse<MentorMetricsResponseDTO>> getMentorMetrics(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "anio") String periodo) {
        try {
            MentorMetricsResponseDTO metrics = entrevistaService.obtenerMetricas(userDetails.getUsername(), periodo);
            return ResponseEntity.ok(ApiResponse.success("Métricas obtenidas con éxito", metrics));
        } catch (Exception e) {
            log.error("Error obteniendo métricas del mentor: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al obtener métricas"));
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
                    req
            );
            return ResponseEntity.ok(ApiResponse.success("Feedback registrado con éxito", null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error guardando feedback de entrevista: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al registrar el feedback: " + e.getMessage()));
        }
    }

    // GET /api/entrevistas/competencias — Obtener catalogo de competencias activas por puesto
    @GetMapping("/competencias")
    public ResponseEntity<ApiResponse<List<Competencia>>> getCompetencias(
            @RequestParam(required = false) String puesto) {
        try {
            List<Competencia> lista;
            if (puesto != null && !puesto.trim().isEmpty()) {
                lista = competenciaRepository.findByPuestoIgnoreCaseAndActivoTrue(puesto.trim());
                // Si esta vacio, cargar las de puesto "General" como fallback
                if (lista.isEmpty()) {
                    lista = competenciaRepository.findByPuestoIgnoreCaseAndActivoTrue("General");
                }
            } else {
                lista = competenciaRepository.findByActivoTrue();
            }
            return ResponseEntity.ok(ApiResponse.success("Competencias obtenidas con exito", lista));
        } catch (Exception e) {
            log.error("Error obteniendo competencias: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al obtener competencias"));
        }
    }

    // POST /api/entrevistas/competencias — Crear una nueva competencia permanente
    @PostMapping("/competencias")
    public ResponseEntity<ApiResponse<Competencia>> crearCompetencia(@RequestBody Competencia competencia) {
        try {
            if (competencia.getActivo() == null) {
                competencia.setActivo(true);
            }
            Competencia guardada = competenciaRepository.save(competencia);
            return ResponseEntity.ok(ApiResponse.success("Competencia creada con exito", guardada));
        } catch (Exception e) {
            log.error("Error creando competencia: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al crear competencia"));
        }
    }

    // DELETE /api/entrevistas/competencias/{id} — Eliminar/desactivar logicamente una competencia
    @DeleteMapping("/competencias/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminarCompetencia(@PathVariable Integer id) {
        try {
            java.util.Optional<Competencia> opt = competenciaRepository.findById(id);
            if (opt.isPresent()) {
                Competencia comp = opt.get();
                comp.setActivo(false);
                competenciaRepository.save(comp);
                return ResponseEntity.ok(ApiResponse.success("Competencia desactivada con exito", null));
            } else {
                return ResponseEntity.status(404).body(ApiResponse.error("Competencia no encontrada"));
            }
        } catch (Exception e) {
            log.error("Error eliminando competencia: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al desactivar competencia"));
        }
    }
}
