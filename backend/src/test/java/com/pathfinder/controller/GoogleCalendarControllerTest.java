package com.pathfinder.controller;

import com.pathfinder.dto.response.CalendarEventDTO;
import com.pathfinder.service.GoogleCalendarService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class GoogleCalendarControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GoogleCalendarService googleCalendarService;

    @Test
    void sync_devuelve200ConEventos() throws Exception {
        when(googleCalendarService.syncEvents(anyString(), anyString(), anyString()))
                .thenReturn(List.of(
                        CalendarEventDTO.builder()
                                .googleEventId("evt1")
                                .summary("Reunión con equipo")
                                .day("Lunes")
                                .startTime("10:00")
                                .endTime("11:00")
                                .allDay(false)
                                .build(),
                        CalendarEventDTO.builder()
                                .googleEventId("evt2")
                                .summary("Entrevista candidato")
                                .day("Miércoles")
                                .startTime("15:00")
                                .endTime("16:00")
                                .allDay(false)
                                .build()
                ));

        String requestBody = """
                {
                    "accessToken": "ya29.mock-token",
                    "weekStart": "2026-06-22",
                    "weekEnd": "2026-06-28"
                }
                """;

        mockMvc.perform(post("/api/disponibilidad/google-calendar/sync")
                        .with(user("mentor@test.com").roles("MENTOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Eventos sincronizados correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].summary").value("Reunión con equipo"))
                .andExpect(jsonPath("$.data[0].day").value("Lunes"))
                .andExpect(jsonPath("$.data[0].startTime").value("10:00"))
                .andExpect(jsonPath("$.data[1].summary").value("Entrevista candidato"))
                .andExpect(jsonPath("$.data[1].day").value("Miércoles"));
    }

    @Test
    void sync_devuelve200ConListaVacia() throws Exception {
        when(googleCalendarService.syncEvents(anyString(), anyString(), anyString()))
                .thenReturn(List.of());

        String requestBody = """
                {
                    "accessToken": "ya29.mock-token",
                    "weekStart": "2026-07-01",
                    "weekEnd": "2026-07-07"
                }
                """;

        mockMvc.perform(post("/api/disponibilidad/google-calendar/sync")
                        .with(user("mentor@test.com").roles("MENTOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    void sync_devuelve400SinAccessToken() throws Exception {
        String requestBody = """
                {
                    "weekStart": "2026-06-22",
                    "weekEnd": "2026-06-28"
                }
                """;

        mockMvc.perform(post("/api/disponibilidad/google-calendar/sync")
                        .with(user("mentor@test.com").roles("MENTOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("accessToken es requerido"));
    }

    @Test
    void sync_devuelve500CuandoServicioLanzaError() throws Exception {
        when(googleCalendarService.syncEvents(anyString(), anyString(), anyString()))
                .thenThrow(new RuntimeException("Token inválido o expirado"));

        String requestBody = """
                {
                    "accessToken": "ya29.bad-token",
                    "weekStart": "2026-06-22",
                    "weekEnd": "2026-06-28"
                }
                """;

        mockMvc.perform(post("/api/disponibilidad/google-calendar/sync")
                        .with(user("mentor@test.com").roles("MENTOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Error al sincronizar")));
    }

    @Test
    void sync_requiereAutenticacion() throws Exception {
        String requestBody = """
                {
                    "accessToken": "ya29.mock-token",
                    "weekStart": "2026-06-22",
                    "weekEnd": "2026-06-28"
                }
                """;

        mockMvc.perform(post("/api/disponibilidad/google-calendar/sync")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().is3xxRedirection());
    }
}
