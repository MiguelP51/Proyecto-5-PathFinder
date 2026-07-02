package com.pathfinder.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathfinder.dto.ai.MentorFeedbackDraftRequestDTO;
import com.pathfinder.dto.ai.MentorFeedbackDraftResponseDTO;
import com.pathfinder.dto.response.PerfilEstudianteResponse;
import com.pathfinder.model.entity.Entrevista;
import com.pathfinder.model.entity.ResultadoDISC;
import com.pathfinder.repository.EntrevistaRepository;
import com.pathfinder.repository.ResultadoDISCRepository;
import com.pathfinder.service.PerfilEstudianteService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MentorFeedbackAiService {

    private final EntrevistaRepository entrevistaRepository;
    private final ResultadoDISCRepository resultadoDISCRepository;
    private final PerfilEstudianteService perfilEstudianteService;
    private final GeminiAiService geminiAiService;
    private final ObjectMapper objectMapper;

    @Transactional
    public MentorFeedbackDraftResponseDTO generarBorrador(
            String correoMentor,
            Integer idEntrevista,
            MentorFeedbackDraftRequestDTO request
    ) {
        Entrevista entrevista = entrevistaRepository.findById(idEntrevista)
                .orElseThrow(() -> new IllegalArgumentException("Entrevista no encontrada"));

        if (!entrevista.getMentor().getCorreo().equals(correoMentor)) {
            throw new SecurityException("No tienes permisos para generar feedback de esta entrevista");
        }

        PerfilEstudianteResponse perfil = perfilEstudianteService.obtenerPerfil(
                entrevista.getEstudiante().getCorreo()
        );

        ResultadoDISC disc = resultadoDISCRepository
                .findFirstByUsuario_IdUsuarioOrderByFechaFinalizacionDesc(
                        entrevista.getEstudiante().getIdUsuario()
                )
                .orElse(null);

        String prompt = buildPrompt(entrevista, perfil, disc, safeRequest(request));
        return geminiAiService.generateJson(prompt, MentorFeedbackDraftResponseDTO.class);
    }

    private MentorFeedbackDraftRequestDTO safeRequest(MentorFeedbackDraftRequestDTO request) {
        return request != null ? request : new MentorFeedbackDraftRequestDTO();
    }

    private String buildPrompt(
            Entrevista entrevista,
            PerfilEstudianteResponse perfil,
            ResultadoDISC disc,
            MentorFeedbackDraftRequestDTO request
    ) {
        Map<String, Object> contexto = new LinkedHashMap<>();
        contexto.put("puestoEntrevista", clean(entrevista.getPuesto()));
        contexto.put("tipoEntrevista", clean(entrevista.getTipo()));
        contexto.put("perfilProfesional", perfil.getPerfilProfesional());
        contexto.put("interesesProfesionales", perfil.getInteresesProfesionales());
        contexto.put("objetivosLaborales", perfil.getObjetivosLaborales());
        contexto.put("formaciones", perfil.getFormaciones());
        contexto.put("experiencias", perfil.getExperiencias());
        contexto.put("habilidades", perfil.getHabilidades());
        contexto.put("idiomas", perfil.getIdiomas());
        contexto.put("herramientas", perfil.getHerramientas());
        contexto.put("disc", buildDiscContext(disc));
        contexto.put("feedbackActual", Map.of(
                "resultadoActual", clean(request.getResultadoActual()),
                "fortalezasActuales", clean(request.getFortalezasActuales()),
                "areasMejoraActuales", clean(request.getAreasMejoraActuales()),
                "comentariosActuales", clean(request.getComentariosActuales()),
                "competenciasEvaluadas", request.getCompetenciasEvaluadas() == null
                        ? List.of()
                        : request.getCompetenciasEvaluadas()
        ));

        return """
                Eres un asistente de apoyo para PathMentors en PathFinder.

                Tu tarea es redactar un borrador de retroalimentacion para una entrevista simulada.

                Reglas obligatorias:
                - Responde en espanol profesional, claro y empatico.
                - No publiques ni tomes decisiones finales; solo generas un borrador editable.
                - No inventes hechos, experiencia, estudios, habilidades ni desempeno observado.
                - Basa el borrador en el perfil, DISC, puesto, competencias seleccionadas y notas actuales del mentor.
                - Si faltan competencias o notas, redacta de forma prudente y agrega una advertencia.
                - No uses lenguaje absoluto ni descalificante.
                - resultadoSugerido solo puede ser "Alta", "Media", "Baja" o cadena vacia.
                - No incluyas datos personales de contacto.
                - Devuelve exclusivamente JSON valido con esta estructura:
                {
                  "resultadoSugerido": "Alta|Media|Baja|",
                  "fortalezas": "texto",
                  "areasMejora": "texto",
                  "comentarios": "texto",
                  "recomendacionesSeguimiento": ["texto"],
                  "advertencias": ["texto"]
                }

                Contexto en JSON:
                %s
                """.formatted(toJson(contexto));
    }

    private String toJson(Map<String, Object> context) {
        try {
            return objectMapper.writeValueAsString(context);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("No se pudo preparar el contexto para IA", e);
        }
    }

    private Map<String, Object> buildDiscContext(ResultadoDISC disc) {
        if (disc == null) {
            return null;
        }

        Map<String, Object> discContext = new LinkedHashMap<>();
        discContext.put("perfilDominante", disc.getPerfilDominante());
        discContext.put("puntajeD", disc.getPuntajeD());
        discContext.put("puntajeI", disc.getPuntajeI());
        discContext.put("puntajeS", disc.getPuntajeS());
        discContext.put("puntajeC", disc.getPuntajeC());
        return discContext;
    }

    private String clean(String value) {
        return StringUtils.hasText(value) ? value.trim() : "";
    }
}
