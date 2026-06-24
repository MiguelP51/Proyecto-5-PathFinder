package com.pathfinder.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathfinder.dto.ai.StudentCvSuggestionsRequestDTO;
import com.pathfinder.dto.ai.StudentCvSuggestionsResponseDTO;
import com.pathfinder.dto.response.PerfilEstudianteResponse;
import com.pathfinder.service.PerfilEstudianteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentCvAiService {

    private final PerfilEstudianteService perfilEstudianteService;
    private final GeminiAiService geminiAiService;
    private final ObjectMapper objectMapper;

    public StudentCvSuggestionsResponseDTO generarSugerencias(
            String correo,
            StudentCvSuggestionsRequestDTO request
    ) {
        PerfilEstudianteResponse perfil = perfilEstudianteService.obtenerPerfil(correo);
        Map<String, Object> contexto = buildContext(perfil, request);
        String prompt = buildPrompt(contexto, request);

        return geminiAiService.generateJson(prompt, StudentCvSuggestionsResponseDTO.class);
    }

    private Map<String, Object> buildContext(
            PerfilEstudianteResponse perfil,
            StudentCvSuggestionsRequestDTO request
    ) {
        Map<String, Object> context = new LinkedHashMap<>();
        context.put("puestoObjetivo", clean(request != null ? request.getPuestoObjetivo() : null));
        context.put("tono", clean(request != null ? request.getTono() : null));
        context.put("incluirEjemplos", request != null && Boolean.TRUE.equals(request.getIncluirEjemplos()));
        context.put("nombreCompleto", perfil.getNombreCompleto());
        context.put("perfilProfesional", perfil.getPerfilProfesional());
        context.put("interesesProfesionales", perfil.getInteresesProfesionales());
        context.put("objetivosLaborales", perfil.getObjetivosLaborales());
        context.put("formaciones", perfil.getFormaciones());
        context.put("experiencias", perfil.getExperiencias());
        context.put("habilidades", perfil.getHabilidades());
        context.put("idiomas", perfil.getIdiomas());
        context.put("herramientas", perfil.getHerramientas());
        context.put("cvUploaded", perfil.isCvUploaded());
        return context;
    }

    private String buildPrompt(
            Map<String, Object> contexto,
            StudentCvSuggestionsRequestDTO request
    ) {
        String contextJson = toJson(contexto);
        boolean incluirEjemplos = request != null && Boolean.TRUE.equals(request.getIncluirEjemplos());

        return """
                Eres un asistente de orientacion profesional para PathFinder, una plataforma peruana para estudiantes universitarios.

                Tu tarea es revisar el perfil profesional y datos extraidos del CV de un estudiante, y devolver sugerencias utiles para mejorar su perfil/CV.

                Reglas obligatorias:
                - Responde en espanol profesional, claro y empatico.
                - No uses lenguaje de aprobado/desaprobado.
                - No uses la palabra evaluacion para describir el resultado.
                - No inventes experiencia, estudios, empresas, herramientas, idiomas ni logros.
                - Si falta informacion, indicalo como campo debil u oportunidad de mejora.
                - La IA solo genera sugerencias revisables; no debe afirmar decisiones finales.
                - Enfocate en claridad, legibilidad, orden, impacto profesional y correspondencia con el puesto objetivo si existe.
                - No incluyas datos personales de contacto en la respuesta.
                - Se muy conciso: maximo 2 sugerencias y 2 camposDebiles.
                - Cada texto debe tener maximo 120 caracteres.
                - versionesMejoradas debe ser [].
                - advertencias debe ser [] salvo que exista una advertencia critica.
                - Devuelve exclusivamente JSON valido con esta estructura:
                {
                  "resumenGeneral": "texto breve",
                  "sugerencias": [
                    {
                      "seccion": "Perfil profesional | Experiencia | Formacion | Habilidades | Idiomas | Herramientas | General",
                      "prioridad": "ALTA | MEDIA | BAJA",
                      "observacion": "texto",
                      "recomendacion": "texto"
                    }
                  ],
                  "camposDebiles": ["texto"],
                  "versionesMejoradas": [
                    {
                      "campo": "texto",
                      "valorActual": "texto",
                      "sugerencia": "texto"
                    }
                  ],
                  "advertencias": ["texto"]
                }

                Si incluirEjemplos es false, evita redactar versiones completas largas y prioriza recomendaciones concretas.
                incluirEjemplos=%s

                Contexto del estudiante en JSON:
                %s
                """.formatted(incluirEjemplos, contextJson);
    }

    private String toJson(Map<String, Object> context) {
        try {
            return objectMapper.writeValueAsString(context);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("No se pudo preparar el contexto del perfil para IA", e);
        }
    }

    private String clean(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
