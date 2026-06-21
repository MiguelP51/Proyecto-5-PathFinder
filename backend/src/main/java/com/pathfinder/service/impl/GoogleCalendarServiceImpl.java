package com.pathfinder.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathfinder.dto.response.CalendarEventDTO;
import com.pathfinder.service.GoogleCalendarService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import static org.springframework.http.HttpStatus.*;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
public class GoogleCalendarServiceImpl implements GoogleCalendarService {

    private static final String CALENDAR_API_URL =
            "https://www.googleapis.com/calendar/v3/calendars/primary/events";

    private static final Map<String, String> DAY_TRANSLATION = Map.ofEntries(
            Map.entry("MONDAY", "Lunes"),
            Map.entry("TUESDAY", "Martes"),
            Map.entry("WEDNESDAY", "Miércoles"),
            Map.entry("THURSDAY", "Jueves"),
            Map.entry("FRIDAY", "Viernes"),
            Map.entry("SATURDAY", "Sábado"),
            Map.entry("SUNDAY", "Domingo")
    );

    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final RestTemplate restTemplate;

    public GoogleCalendarServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public List<CalendarEventDTO> syncEvents(String accessToken, String weekStart, String weekEnd) {
        if (accessToken == null || accessToken.isBlank()) {
            throw new IllegalArgumentException("Access token is required");
        }

        String url = String.format(
                "%s?timeMin=%sT00:00:00Z&timeMax=%sT23:59:59Z&singleEvents=true&orderBy=startTime",
                CALENDAR_API_URL, weekStart, weekEnd
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                String body = response.getBody();
                log.error("Google Calendar API error: {} - {}", response.getStatusCode(), body);

                if (response.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                    throw new RuntimeException("El token de acceso no es válido o ha expirado. Vuelve a intentar la sincronización.");
                }
                if (response.getStatusCode() == HttpStatus.FORBIDDEN) {
                    throw new RuntimeException("Sin permisos para acceder al calendario. Verifica los permisos de la aplicación en tu cuenta de Google.");
                }
                if (response.getStatusCode() == HttpStatus.NOT_FOUND) {
                    throw new RuntimeException("No se encontró el calendario principal. Verifica tu cuenta de Google.");
                }

                String errorMessage = extractErrorMessage(body);
                throw new RuntimeException("Error al consultar Google Calendar: " + response.getStatusCode() +
                        (errorMessage != null ? " - " + errorMessage : ""));
            }

            return parseEvents(response.getBody());
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error syncing Google Calendar events: {}", e.getMessage(), e);
            throw new RuntimeException("Error al sincronizar eventos de Google Calendar: " + e.getMessage(), e);
        }
    }

    private List<CalendarEventDTO> parseEvents(String json) {
        List<CalendarEventDTO> events = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode items = root.get("items");

            if (items == null || !items.isArray()) {
                return events;
            }

            for (JsonNode item : items) {
                String id = item.has("id") ? item.get("id").asText() : null;
                String summary = item.has("summary") ? item.get("summary").asText() : "(Sin título)";

                JsonNode start = item.get("start");
                JsonNode end = item.get("end");

                if (start == null || end == null) continue;

                boolean allDay = start.has("date") && !start.has("dateTime");

                if (allDay) {
                    String dateStr = start.get("date").asText();
                    LocalDate date = LocalDate.parse(dateStr);
                    String dayName = DAY_TRANSLATION.get(
                            date.getDayOfWeek().name()
                    );
                    events.add(CalendarEventDTO.builder()
                            .googleEventId(id)
                            .summary(summary)
                            .day(dayName)
                            .startTime("00:00")
                            .endTime("23:59")
                            .allDay(true)
                            .build());
                } else {
                    String startStr = start.get("dateTime").asText();
                    String endStr = end.get("dateTime").asText();

                    ZonedDateTime startZdt = ZonedDateTime.parse(startStr);
                    ZonedDateTime endZdt = ZonedDateTime.parse(endStr);

                    String dayName = DAY_TRANSLATION.get(
                            startZdt.getDayOfWeek().name()
                    );

                    String startTime = startZdt.toLocalTime().format(TIME_FORMATTER);
                    String endTime = endZdt.toLocalTime().format(TIME_FORMATTER);

                    events.add(CalendarEventDTO.builder()
                            .googleEventId(id)
                            .summary(summary)
                            .day(dayName)
                            .startTime(startTime)
                            .endTime(endTime)
                            .allDay(false)
                            .build());
                }
            }
        } catch (Exception e) {
            log.error("Error parsing Google Calendar events: {}", e.getMessage(), e);
            throw new RuntimeException("Error al procesar eventos de Google Calendar", e);
        }

        return events;
    }

    private String extractErrorMessage(String body) {
        try {
            JsonNode error = objectMapper.readTree(body);
            JsonNode errorNode = error.get("error");
            if (errorNode != null && errorNode.has("message")) {
                return errorNode.get("message").asText();
            }
            if (error.has("error_description")) {
                return error.get("error_description").asText();
            }
            if (error.has("message")) {
                return error.get("message").asText();
            }
        } catch (Exception ignored) {}
        return body.length() > 200 ? body.substring(0, 200) + "..." : body;
    }
}
