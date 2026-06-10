package com.pathfinder.controller;

import com.pathfinder.dto.admin.disc.PreguntaDISCResponseDTO;
import com.pathfinder.dto.request.RespuestaDISCRequestDTO;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.ResultadoDISCResponseDTO;
import com.pathfinder.service.DISCTestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/disc")
@RequiredArgsConstructor
public class DISCTestController {

    private final DISCTestService discTestService;

    // GET /api/disc/questions  — obtener preguntas activas del test (HU-EST-11)
    @GetMapping("/questions")
    public ResponseEntity<ApiResponse<List<PreguntaDISCResponseDTO>>> getQuestions(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<PreguntaDISCResponseDTO> preguntas = discTestService.obtenerPreguntas(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Preguntas obtenidas con éxito", preguntas));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(ApiResponse.error(e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error obteniendo las preguntas del test DISC"));
        }
    }

    // POST /api/disc/submit  — enviar respuestas y calcular resultado (HU-EST-11 / HU-EST-12)
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<ResultadoDISCResponseDTO>> submitAnswers(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody List<RespuestaDISCRequestDTO> respuestas) {
        try {
            ResultadoDISCResponseDTO resultado = discTestService.guardarRespuestas(userDetails.getUsername(), respuestas);
            return ResponseEntity.ok(ApiResponse.success("Test finalizado y procesado con éxito", resultado));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(ApiResponse.error(e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error procesando las respuestas del test DISC"));
        }
    }

    // GET /api/disc/result  — obtener resultado calculado del test (HU-EST-12)
    @GetMapping("/result")
    public ResponseEntity<ApiResponse<ResultadoDISCResponseDTO>> getResult(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            ResultadoDISCResponseDTO resultado = discTestService.obtenerResultado(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Resultado del test obtenido con éxito", resultado));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(ApiResponse.error(e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error obteniendo el resultado del test DISC"));
        }
    }

    // GET /api/disc/result/student/{id}  — obtener resultado del test para el mentor (HU-PM-05)
    @GetMapping("/result/student/{id}")
    public ResponseEntity<ApiResponse<ResultadoDISCResponseDTO>> getStudentResult(
            @PathVariable Integer id) {
        try {
            ResultadoDISCResponseDTO resultado = discTestService.obtenerResultadoPorUsuarioId(id);
            return ResponseEntity.ok(ApiResponse.success("Resultado del test obtenido con éxito", resultado));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(ApiResponse.error(e.getReason()));
        } catch (Exception e) {
            log.error("Error obteniendo resultado DISC del estudiante: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error obteniendo el resultado del test DISC del estudiante"));
        }
    }
}
