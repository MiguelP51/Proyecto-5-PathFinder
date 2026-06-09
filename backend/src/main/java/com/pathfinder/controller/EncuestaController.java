package com.pathfinder.controller;

import com.pathfinder.dto.request.SubmitEncuestaRequestDTO;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.PreguntaResponseDTO;
import com.pathfinder.service.EncuestaService;
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
@RequestMapping("/api/encuestas")
@RequiredArgsConstructor
public class EncuestaController {

    private final EncuestaService encuestaService;

    // GET /api/encuestas/preguntas — Obtiene las preguntas activas
    @GetMapping("/preguntas")
    public ResponseEntity<ApiResponse<List<PreguntaResponseDTO>>> getPreguntas() {
        try {
            List<PreguntaResponseDTO> preguntas = encuestaService.obtenerPreguntasActivas();
            return ResponseEntity.ok(ApiResponse.success("Preguntas de la encuesta obtenidas con éxito", preguntas));
        } catch (Exception e) {
            log.error("Error obteniendo preguntas de la encuesta: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al obtener las preguntas de la encuesta"));
        }
    }

    // GET /api/encuestas/completada — Retorna si el estudiante ya completó la encuesta
    @GetMapping("/completada")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkCompletada(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            boolean completada = encuestaService.tieneEncuestaCompletada(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Consulta de estado de encuesta exitosa", Map.of("completada", completada)));
        } catch (Exception e) {
            log.error("Error consultando estado de encuesta: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al consultar el estado de la encuesta"));
        }
    }

    // POST /api/encuestas/submit — Envía las respuestas de la encuesta
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<Void>> submitEncuesta(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SubmitEncuestaRequestDTO request) {
        try {
            encuestaService.guardarEncuesta(userDetails.getUsername(), request);
            return ResponseEntity.ok(ApiResponse.success("Encuesta guardada correctamente. ¡Gracias por tus comentarios!", null));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error guardando respuestas de encuesta: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al guardar las respuestas de la encuesta: " + e.getMessage()));
        }
    }
}
