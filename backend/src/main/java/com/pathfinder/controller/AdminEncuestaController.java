package com.pathfinder.controller;

import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.model.entity.PreguntaEncuesta;
import com.pathfinder.model.entity.RespuestaEncuesta;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.entity.Entrevista;
import com.pathfinder.repository.PreguntaEncuestaRepository;
import com.pathfinder.repository.RespuestaEncuestaRepository;
import com.pathfinder.repository.PuestoEntrevistaRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin/encuestas")
@RequiredArgsConstructor
public class AdminEncuestaController {

    private final PreguntaEncuestaRepository preguntaRepository;
    private final RespuestaEncuestaRepository respuestaRepository;
    private final PuestoEntrevistaRepository puestoRepository;

    // GET /api/admin/encuestas/preguntas
    @GetMapping("/preguntas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PreguntaEncuesta>>> getAllPreguntas() {
        try {
            List<PreguntaEncuesta> preguntas = preguntaRepository.findAll();
            preguntas.sort(Comparator.comparing(PreguntaEncuesta::getIdPregunta));
            return ResponseEntity.ok(ApiResponse.success("Preguntas de la encuesta obtenidas con éxito", preguntas));
        } catch (Exception e) {
            log.error("Error al obtener preguntas de encuesta: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al obtener preguntas"));
        }
    }

    // POST /api/admin/encuestas/preguntas
    @PostMapping("/preguntas")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<PreguntaEncuesta>> createPregunta(
            @RequestBody Map<String, Object> payload) {
        try {
            String texto = (String) payload.get("textoPregunta");
            String tipo = (String) payload.get("tipoPregunta"); // "RATING" or "TEXT"
            Boolean obligatoria = (Boolean) payload.getOrDefault("obligatoria", false);

            if (texto == null || texto.trim().isEmpty() || tipo == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("El texto y tipo son obligatorios"));
            }

            PreguntaEncuesta pregunta = new PreguntaEncuesta();
            pregunta.setTextoPregunta(texto.trim());
            pregunta.setTipoPregunta(tipo.trim().toUpperCase());
            pregunta.setObligatoria(obligatoria);
            pregunta.setActivo(true);

            PreguntaEncuesta saved = preguntaRepository.save(pregunta);
            return ResponseEntity.ok(ApiResponse.success("Pregunta creada con éxito", saved));
        } catch (Exception e) {
            log.error("Error al crear pregunta de encuesta: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al crear la pregunta"));
        }
    }

    // PUT /api/admin/encuestas/preguntas/{id}
    @PutMapping("/preguntas/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<PreguntaEncuesta>> updatePregunta(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> payload) {
        try {
            PreguntaEncuesta pregunta = preguntaRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Pregunta no encontrada"));

            if (payload.containsKey("textoPregunta")) {
                pregunta.setTextoPregunta(((String) payload.get("textoPregunta")).trim());
            }
            if (payload.containsKey("tipoPregunta")) {
                pregunta.setTipoPregunta(((String) payload.get("tipoPregunta")).trim().toUpperCase());
            }
            if (payload.containsKey("obligatoria")) {
                pregunta.setObligatoria((Boolean) payload.get("obligatoria"));
            }
            if (payload.containsKey("activo")) {
                pregunta.setActivo((Boolean) payload.get("activo"));
            }

            PreguntaEncuesta saved = preguntaRepository.save(pregunta);
            return ResponseEntity.ok(ApiResponse.success("Pregunta actualizada con éxito", saved));
        } catch (Exception e) {
            log.error("Error al actualizar pregunta de encuesta: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al actualizar la pregunta"));
        }
    }

    // GET /api/admin/encuestas/submissions
    @GetMapping("/submissions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<EncuestaSubmissionResponseDTO>>> getAllSubmissions() {
        try {
            List<RespuestaEncuesta> todasRespuestas = respuestaRepository.findAll();
            
            Map<String, List<RespuestaEncuesta>> agrupadas = todasRespuestas.stream()
                .collect(Collectors.groupingBy(r -> {
                    if (r.getEntrevista() != null) {
                        return "entrevista_" + r.getEntrevista().getIdEntrevista();
                    } else {
                        String timeKey = r.getFechaCompletada() != null ? r.getFechaCompletada().withNano(0).toString() : "unknown";
                        return "estudiante_" + r.getEstudiante().getIdUsuario() + "_" + timeKey;
                    }
                }));

            List<EncuestaSubmissionResponseDTO> responseList = new ArrayList<>();
            for (Map.Entry<String, List<RespuestaEncuesta>> entry : agrupadas.entrySet()) {
                List<RespuestaEncuesta> respuestas = entry.getValue();
                if (respuestas.isEmpty()) continue;

                RespuestaEncuesta primera = respuestas.get(0);
                Usuario estudiante = primera.getEstudiante();
                Entrevista entrevista = primera.getEntrevista();
                
                Integer idSubmission = entrevista != null ? entrevista.getIdEntrevista() : primera.getIdRespuesta();
                String surveyTitle = "Encuesta Post-Entrevista (PathMentor)";
                if (entrevista != null && entrevista.getPuesto() != null) {
                    String areaNombre = puestoRepository.findFirstByNombreIgnoreCase(entrevista.getPuesto())
                        .map(p -> p.getArea() != null ? p.getArea().getNombre() : "General")
                        .orElse("General");
                    surveyTitle += " - Área: " + areaNombre + " (" + entrevista.getPuesto() + ")";
                }

                List<EncuestaSubmissionResponseDTO.AnswerDTO> answerDTOs = respuestas.stream()
                    .map(r -> EncuestaSubmissionResponseDTO.AnswerDTO.builder()
                        .questionText(r.getPregunta().getTextoPregunta())
                        .questionType(r.getPregunta().getTipoPregunta())
                        .section("MENTOR")
                        .ratingValue(r.getValorEntero())
                        .textValue(r.getValorTexto())
                        .build())
                    .collect(Collectors.toList());

                responseList.add(EncuestaSubmissionResponseDTO.builder()
                    .idSubmission(idSubmission)
                    .studentName(estudiante.getNombreCompleto())
                    .studentEmail(estudiante.getCorreo())
                    .surveyTitle(surveyTitle)
                    .submittedAt(primera.getFechaCompletada() != null ? primera.getFechaCompletada() : primera.getFechaRegistro())
                    .answers(answerDTOs)
                    .build());
            }

            responseList.sort((a, b) -> {
                if (a.getSubmittedAt() == null || b.getSubmittedAt() == null) return 0;
                return b.getSubmittedAt().compareTo(a.getSubmittedAt());
            });

            return ResponseEntity.ok(ApiResponse.success("Entregas de encuesta obtenidas con éxito", responseList));
        } catch (Exception e) {
            log.error("Error al obtener entregas de encuesta: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al obtener entregas"));
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EncuestaSubmissionResponseDTO {
        private Integer idSubmission;
        private String studentName;
        private String studentEmail;
        private String surveyTitle;
        private LocalDateTime submittedAt;
        private List<AnswerDTO> answers;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class AnswerDTO {
            private String questionText;
            private String questionType;
            private String section;
            private Integer ratingValue;
            private String textValue;
        }
    }
}
