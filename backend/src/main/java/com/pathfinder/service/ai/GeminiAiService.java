package com.pathfinder.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathfinder.config.AiProperties;
import com.pathfinder.dto.ai.MentorFeedbackDraftResponseDTO;
import com.pathfinder.dto.ai.MentorInterviewRecommendationsResponseDTO;
import com.pathfinder.dto.ai.StudentCvSuggestionsResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import static java.util.Map.entry;

@Service
@RequiredArgsConstructor
public class GeminiAiService {

    private static final String GEMINI_INTERACTIONS_URL =
            "https://generativelanguage.googleapis.com/v1beta/interactions";

    private final AiProperties aiProperties;
    private final ObjectMapper objectMapper;

    public <T> T generateJson(String prompt, Class<T> responseType) {
        String responseText = generateText(prompt, responseType);
        String json = extractJson(responseText);

        try {
            if (StudentCvSuggestionsResponseDTO.class.equals(responseType)) {
                return responseType.cast(parseStudentCvSuggestions(json));
            }

            return objectMapper.readValue(json, responseType);
        } catch (IOException e) {
            throw new IllegalStateException("La respuesta de Gemini no tiene el formato esperado ("
                    + e.getClass().getSimpleName() + ": " + e.getMessage() + "): "
                    + truncate(json), e);
        }
    }

    private String generateText(String prompt, Class<?> responseType) {
        validateConfiguration();

        try {
            HttpClient client = HttpClient.newBuilder()
                    .version(HttpClient.Version.HTTP_1_1)
                    .connectTimeout(Duration.ofMillis(aiProperties.getTimeoutMs()))
                    .build();

            String body = objectMapper.writeValueAsString(Map.of(
                    "model", normalizeModel(aiProperties.getModel()),
                    "input", prompt,
                    "generation_config", Map.of(
                            "temperature", 0.2,
                            "thinking_level", "low",
                            "max_output_tokens", aiProperties.getMaxOutputTokens()
                    ),
                    "response_format", buildResponseFormat(responseType)
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GEMINI_INTERACTIONS_URL))
                    .version(HttpClient.Version.HTTP_1_1)
                    .timeout(Duration.ofMillis(aiProperties.getTimeoutMs()))
                    .header("x-goog-api-key", aiProperties.getApiKey())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Gemini devolvio estado " + response.statusCode()
                        + ": " + truncate(response.body()));
            }

            return extractText(response.body());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("La llamada a Gemini fue interrumpida", e);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo conectar con Gemini: "
                    + e.getClass().getSimpleName() + " - " + e.getMessage(), e);
        }
    }

    private Map<String, Object> buildResponseFormat(Class<?> responseType) {
        if (MentorFeedbackDraftResponseDTO.class.equals(responseType)) {
            return buildMentorFeedbackDraftResponseFormat();
        }

        if (MentorInterviewRecommendationsResponseDTO.class.equals(responseType)) {
            return buildMentorRecommendationsResponseFormat();
        }

        return buildCvSuggestionsResponseFormat();
    }

    private void validateConfiguration() {
        if (!aiProperties.isEnabled()) {
            throw new IllegalStateException("La integracion con Gemini esta desactivada");
        }

        if (!StringUtils.hasText(aiProperties.getApiKey())) {
            throw new IllegalStateException("La API key de Gemini no esta configurada");
        }
    }

    private String normalizeModel(String model) {
        if (!StringUtils.hasText(model)) {
            return "gemini-3.5-flash";
        }

        return model.startsWith("models/") ? model.substring("models/".length()) : model;
    }

    private String extractText(String responseBody) throws IOException {
        JsonNode root = objectMapper.readTree(responseBody);
        String outputText = root.path("output_text").asText();

        if (StringUtils.hasText(outputText)) {
            return outputText;
        }

        JsonNode steps = root.path("steps");
        if (steps.isArray()) {
            for (JsonNode step : steps) {
                if (!"model_output".equals(step.path("type").asText())) {
                    continue;
                }

                String stepText = extractTextFromNode(step.path("content"));
                if (StringUtils.hasText(stepText)) {
                    return stepText;
                }
            }
        }

        JsonNode candidates = root.path("candidates");
        if (candidates.isArray()) {
            for (JsonNode candidate : candidates) {
                String candidateText = extractTextFromNode(candidate.path("content").path("parts"));
                if (StringUtils.hasText(candidateText)) {
                    return candidateText;
                }
            }
        }

        throw new IllegalStateException("Gemini devolvio una respuesta vacia");
    }

    private String extractTextFromNode(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }

        if (node.isTextual()) {
            String value = node.asText();
            return StringUtils.hasText(value) ? value : null;
        }

        if (node.has("text")) {
            String value = node.path("text").asText();
            if (StringUtils.hasText(value)) {
                return value;
            }
        }

        if (node.has("output_text")) {
            String value = node.path("output_text").asText();
            if (StringUtils.hasText(value)) {
                return value;
            }
        }

        if (node.isArray()) {
            for (JsonNode child : node) {
                String value = extractTextFromNode(child);
                if (StringUtils.hasText(value)) {
                    return value;
                }
            }
        }

        return null;
    }

    private String extractJson(String text) {
        String trimmed = text.trim();

        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```(?:json)?", "").replaceFirst("```$", "").trim();
        }

        int objectStart = trimmed.indexOf('{');
        int objectEnd = trimmed.lastIndexOf('}');

        if (objectStart >= 0 && objectEnd > objectStart) {
            return trimmed.substring(objectStart, objectEnd + 1);
        }

        return trimmed;
    }

    private Map<String, Object> buildCvSuggestionsResponseFormat() {
        return Map.of(
                "type", "text",
                "mime_type", "application/json",
                "schema", Map.of(
                        "type", "object",
                        "properties", Map.ofEntries(
                                entry("resumenGeneral", Map.of(
                                        "type", "string",
                                        "maxLength", 180
                                )),
                                entry("accionesPrioritarias", Map.of(
                                        "type", "array",
                                        "maxItems", 2,
                                        "items", Map.of(
                                                "type", "object",
                                                "properties", Map.of(
                                                        "titulo", Map.of("type", "string", "maxLength", 80),
                                                        "motivo", Map.of("type", "string", "maxLength", 140),
                                                        "accion", Map.of("type", "string", "maxLength", 140)
                                                ),
                                                "required", List.of("titulo", "motivo", "accion")
                                        )
                                )),
                                entry("camposPorCompletar", Map.of(
                                        "type", "array",
                                        "maxItems", 2,
                                        "items", Map.of("type", "string", "maxLength", 80)
                                )),
                                entry("perfilProfesionalSugerido", Map.of(
                                        "type", "string",
                                        "maxLength", 280
                                ))
                        ),
                        "required", List.of(
                                "resumenGeneral",
                                "accionesPrioritarias",
                                "camposPorCompletar",
                                "perfilProfesionalSugerido"
                        )
                )
        );
    }

    private Map<String, Object> buildMentorRecommendationsResponseFormat() {
        return Map.of(
                "type", "text",
                "mime_type", "application/json",
                "schema", Map.of(
                        "type", "object",
                        "properties", Map.ofEntries(
                                entry("resumenEstudiante", Map.of(
                                        "type", "string",
                                        "maxLength", 220
                                )),
                                entry("tipsCv", Map.of(
                                        "type", "array",
                                        "maxItems", 3,
                                        "items", Map.of("type", "string", "maxLength", 160)
                                )),
                                entry("skillpathsRecomendados", Map.of(
                                        "type", "array",
                                        "maxItems", 3,
                                        "items", Map.of(
                                                "type", "object",
                                                "properties", Map.of(
                                                        "idSkillPath", Map.of("type", "integer"),
                                                        "titulo", Map.of("type", "string", "maxLength", 120),
                                                        "prioridad", Map.of("type", "string", "maxLength", 10),
                                                        "motivo", Map.of("type", "string", "maxLength", 180)
                                                ),
                                                "required", List.of("idSkillPath", "titulo", "prioridad", "motivo")
                                        )
                                )),
                                entry("preguntasSugeridas", Map.of(
                                        "type", "array",
                                        "maxItems", 4,
                                        "items", Map.of(
                                                "type", "object",
                                                "properties", Map.of(
                                                        "tipo", Map.of("type", "string", "maxLength", 30),
                                                        "pregunta", Map.of("type", "string", "maxLength", 180),
                                                        "objetivo", Map.of("type", "string", "maxLength", 160)
                                                ),
                                                "required", List.of("tipo", "pregunta", "objetivo")
                                        )
                                )),
                                entry("puntosAValidar", Map.of(
                                        "type", "array",
                                        "maxItems", 3,
                                        "items", Map.of("type", "string", "maxLength", 160)
                                ))
                        ),
                        "required", List.of(
                                "resumenEstudiante",
                                "tipsCv",
                                "skillpathsRecomendados",
                                "preguntasSugeridas",
                                "puntosAValidar"
                        )
                )
        );
    }

    private Map<String, Object> buildMentorFeedbackDraftResponseFormat() {
        return Map.of(
                "type", "text",
                "mime_type", "application/json",
                "schema", Map.of(
                        "type", "object",
                        "properties", Map.ofEntries(
                                entry("resultadoSugerido", Map.of(
                                        "type", "string",
                                        "maxLength", 10
                                )),
                                entry("fortalezas", Map.of(
                                        "type", "string",
                                        "maxLength", 600
                                )),
                                entry("areasMejora", Map.of(
                                        "type", "string",
                                        "maxLength", 600
                                )),
                                entry("comentarios", Map.of(
                                        "type", "string",
                                        "maxLength", 700
                                )),
                                entry("recomendacionesSeguimiento", Map.of(
                                        "type", "array",
                                        "maxItems", 3,
                                        "items", Map.of("type", "string", "maxLength", 160)
                                )),
                                entry("advertencias", Map.of(
                                        "type", "array",
                                        "maxItems", 2,
                                        "items", Map.of("type", "string", "maxLength", 160)
                                ))
                        ),
                        "required", List.of(
                                "resultadoSugerido",
                                "fortalezas",
                                "areasMejora",
                                "comentarios",
                                "recomendacionesSeguimiento",
                                "advertencias"
                        )
                )
        );
    }

    private StudentCvSuggestionsResponseDTO parseStudentCvSuggestions(String json) throws IOException {
        JsonNode root = objectMapper.readTree(json);
        StudentCvSuggestionsResponseDTO response = new StudentCvSuggestionsResponseDTO();

        response.setResumenGeneral(text(root.path("resumenGeneral")));
        response.setPerfilProfesionalSugerido(text(root.path("perfilProfesionalSugerido")));

        JsonNode acciones = root.path("accionesPrioritarias");
        if (acciones.isArray()) {
            int index = 0;
            for (JsonNode item : acciones) {
                StudentCvSuggestionsResponseDTO.ActionItemDTO action =
                        StudentCvSuggestionsResponseDTO.ActionItemDTO.builder()
                                .titulo(text(item.path("titulo")))
                                .motivo(text(item.path("motivo")))
                                .accion(text(item.path("accion")))
                                .build();

                response.getAccionesPrioritarias().add(action);
                response.getSugerencias().add(StudentCvSuggestionsResponseDTO.SuggestionItemDTO.builder()
                        .seccion(action.getTitulo())
                        .prioridad(index == 0 ? "ALTA" : "MEDIA")
                        .observacion(action.getMotivo())
                        .recomendacion(action.getAccion())
                        .build());
                index++;
            }
        } else {
            JsonNode sugerencias = root.path("sugerencias");
            if (sugerencias.isArray()) {
                for (JsonNode item : sugerencias) {
                    response.getSugerencias().add(StudentCvSuggestionsResponseDTO.SuggestionItemDTO.builder()
                            .seccion(text(item.path("seccion")))
                            .prioridad(text(item.path("prioridad")))
                            .observacion(text(item.path("observacion")))
                            .recomendacion(text(item.path("recomendacion")))
                            .build());
                }
            }
        }

        addStringItems(response.getCamposPorCompletar(), root.path("camposPorCompletar"));
        if (response.getCamposPorCompletar().isEmpty()) {
            addStringItems(response.getCamposPorCompletar(), root.path("camposDebiles"));
        }
        response.getCamposDebiles().addAll(response.getCamposPorCompletar());

        JsonNode versiones = root.path("versionesMejoradas");
        if (versiones.isArray()) {
            for (JsonNode item : versiones) {
                response.getVersionesMejoradas().add(StudentCvSuggestionsResponseDTO.ImprovedFieldDTO.builder()
                        .campo(text(item.path("campo")))
                        .valorActual(text(item.path("valorActual")))
                        .sugerencia(text(item.path("sugerencia")))
                        .build());
            }
        }

        addStringItems(response.getAdvertencias(), root.path("advertencias"));
        return response;
    }

    private void addStringItems(List<String> target, JsonNode node) {
        if (!node.isArray()) {
            String value = text(node);
            if (StringUtils.hasText(value)) {
                target.add(value);
            }
            return;
        }

        for (JsonNode item : node) {
            String value = text(item);
            if (StringUtils.hasText(value)) {
                target.add(value);
            }
        }
    }

    private String text(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }

        if (node.isTextual()) {
            return node.asText();
        }

        if (node.isNumber() || node.isBoolean()) {
            return node.asText();
        }

        return node.toString();
    }

    private String truncate(String value) {
        if (value == null || value.length() <= 500) {
            return value;
        }

        return value.substring(0, 500) + "...";
    }
}
