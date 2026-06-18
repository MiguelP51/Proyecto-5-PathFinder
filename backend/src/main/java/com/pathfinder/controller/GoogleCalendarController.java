package com.pathfinder.controller;

import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.CalendarEventDTO;
import com.pathfinder.service.GoogleCalendarService;
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
@RequestMapping("/api/disponibilidad/google-calendar")
@RequiredArgsConstructor
public class GoogleCalendarController {

    private final GoogleCalendarService googleCalendarService;

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<List<CalendarEventDTO>>> syncCalendar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> request) {

        String accessToken = request.get("accessToken");
        String weekStart = request.get("weekStart");
        String weekEnd = request.get("weekEnd");

        if (accessToken == null || accessToken.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("accessToken es requerido"));
        }
        if (weekStart == null || weekEnd == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("weekStart y weekEnd son requeridos"));
        }

        try {
            log.info("Sincronizando Google Calendar para usuario {}", userDetails.getUsername());
            List<CalendarEventDTO> events = googleCalendarService.syncEvents(accessToken, weekStart, weekEnd);
            return ResponseEntity.ok(ApiResponse.success("Eventos sincronizados correctamente", events));
        } catch (IllegalArgumentException e) {
            log.warn("Solicitud inválida: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error sincronizando Google Calendar: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error(
                    "Error al sincronizar Google Calendar: " + e.getMessage()
            ));
        }
    }
}
