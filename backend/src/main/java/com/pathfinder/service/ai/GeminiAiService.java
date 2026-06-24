package com.pathfinder.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathfinder.config.AiProperties;
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
        String responseText = generateText(prompt);
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

    private String generateText(String prompt) {
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
                    "response_format", buildCvSuggestionsResponseFormat()
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
                                        "maxLength", 160
                                )),
                                entry("sugerencias", Map.of(
                                        "type", "array",
                                        "maxItems", 2,
                                        "items", Map.of(
                                                "type", "object",
                                                "properties", Map.of(
                                                        "seccion", Map.of("type", "string", "maxLength", 40),
                                                        "prioridad", Map.of("type", "string", "enum", List.of("ALTA", "MEDIA", "BAJA")),
                                                        "observacion", Map.of("type", "string", "maxLength", 120),
                                                        "recomendacion", Map.of("type", "string", "maxLength", 120)
                                                ),
                                                "required", List.of("seccion", "prioridad", "observacion", "recomendacion")
                                        )
                                )),
                                entry("camposDebiles", Map.of(
                                        "type", "array",
                                        "maxItems", 2,
                                        "items", Map.of("type", "string", "maxLength", 80)
                                )),
                                entry("versionesMejoradas", Map.of(
                                        "type", "array",
                                        "maxItems", 0,
                                        "items", Map.of(
                                                "type", "object",
                                                "properties", Map.of(
                                                        "campo", Map.of("type", "string", "maxLength", 60),
                                                        "valorActual", Map.of("type", "string", "maxLength", 160),
                                                        "sugerencia", Map.of("type", "string", "maxLength", 220)
                                                ),
                                                "required", List.of("campo", "valorActual", "sugerencia")
                                        )
                                )),
                                entry("advertencias", Map.of(
                                        "type", "array",
                                        "maxItems", 1,
                                        "items", Map.of("type", "string", "maxLength", 80)
                                ))
                        ),
                        "required", List.of(
                                "resumenGeneral",
                                "sugerencias",
                                "camposDebiles",
                                "versionesMejoradas",
                                "advertencias"
                        )
                )
        );
    }

    private StudentCvSuggestionsResponseDTO parseStudentCvSuggestions(String json) throws IOException {
        JsonNode root = objectMapper.readTree(json);
        StudentCvSuggestionsResponseDTO response = new StudentCvSuggestionsResponseDTO();

        response.setResumenGeneral(text(root.path("resumenGeneral")));

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

        addStringItems(response.getCamposDebiles(), root.path("camposDebiles"));

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
