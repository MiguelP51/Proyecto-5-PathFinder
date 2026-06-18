package com.pathfinder.controller;

import com.pathfinder.dto.response.MentorDisponibilidadCompletaDTO;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.enums.RolUsuario;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.service.DisponibilidadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class DisponibilidadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DisponibilidadService disponibilidadService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private static final String MENTOR_EMAIL = "mentor_controller@test.com";

    @BeforeEach
    void setUp() {
        Usuario mentor = new Usuario();
        mentor.setCorreo(MENTOR_EMAIL);
        mentor.setNombreCompleto("Controller Test Mentor");
        mentor.setRol(RolUsuario.MENTOR);
        usuarioRepository.save(mentor);
    }

    @Test
    void getMentorAvailability_devuelve200ConDatosPorDefecto() throws Exception {
        mockMvc.perform(get("/api/disponibilidad/mentor")
                        .with(user(MENTOR_EMAIL).roles("MENTOR"))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.duracionEntrevista").value(60))
                .andExpect(jsonPath("$.data.tiempoEntreEntrevistas").value(15))
                .andExpect(jsonPath("$.data.maxEntrevistasDia").value(4))
                .andExpect(jsonPath("$.data.diasDisponibles", hasItems("Lunes", "Miércoles", "Viernes")))
                .andExpect(jsonPath("$.data.bloques").isEmpty());
    }

    @Test
    void postMentorAvailability_guardaYRetorna200() throws Exception {
        String requestBody = """
                {
                    "duracionEntrevista": 45,
                    "tiempoEntreEntrevistas": 10,
                    "maxEntrevistasDia": 3,
                    "diasDisponibles": ["Lunes", "Martes", "Jueves"],
                    "bloques": [
                        {
                            "diaSemana": "Lunes",
                            "horaInicio": "09:00",
                            "horaFin": "11:00",
                            "tipoEntrevista": "virtual"
                        },
                        {
                            "diaSemana": "Martes",
                            "horaInicio": "14:00",
                            "horaFin": "16:00",
                            "tipoEntrevista": "presencial"
                        }
                    ]
                }
                """;

        mockMvc.perform(post("/api/disponibilidad/mentor")
                        .with(user(MENTOR_EMAIL).roles("MENTOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Disponibilidad guardada correctamente"));
    }

    @Test
    void postYGet_retornaDatosGuardados() throws Exception {
        String requestBody = """
                {
                    "duracionEntrevista": 30,
                    "tiempoEntreEntrevistas": 5,
                    "maxEntrevistasDia": 6,
                    "diasDisponibles": ["Lunes", "Miércoles", "Viernes"],
                    "bloques": [
                        {
                            "diaSemana": "Lunes",
                            "horaInicio": "10:00",
                            "horaFin": "13:00",
                            "tipoEntrevista": "virtual"
                        }
                    ]
                }
                """;

        mockMvc.perform(post("/api/disponibilidad/mentor")
                        .with(user(MENTOR_EMAIL).roles("MENTOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/disponibilidad/mentor")
                        .with(user(MENTOR_EMAIL).roles("MENTOR"))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.duracionEntrevista").value(30))
                .andExpect(jsonPath("$.data.tiempoEntreEntrevistas").value(5))
                .andExpect(jsonPath("$.data.maxEntrevistasDia").value(6))
                .andExpect(jsonPath("$.data.bloques", hasSize(1)))
                .andExpect(jsonPath("$.data.bloques[0].diaSemana").value("Lunes"))
                .andExpect(jsonPath("$.data.bloques[0].horaInicio").value("10:00"))
                .andExpect(jsonPath("$.data.bloques[0].tipoEntrevista").value("virtual"));
    }

    @Test
    void deleteMentorAvailability_eliminaBloqueYRetorna200() throws Exception {
        String saveBody = """
                {
                    "duracionEntrevista": 60,
                    "tiempoEntreEntrevistas": 15,
                    "maxEntrevistasDia": 4,
                    "diasDisponibles": ["Lunes"],
                    "bloques": [
                        {
                            "diaSemana": "Lunes",
                            "horaInicio": "11:00",
                            "horaFin": "12:00",
                            "tipoEntrevista": "virtual"
                        }
                    ]
                }
                """;

        mockMvc.perform(post("/api/disponibilidad/mentor")
                        .with(user(MENTOR_EMAIL).roles("MENTOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(saveBody));

        String getResponse = mockMvc.perform(get("/api/disponibilidad/mentor")
                        .with(user(MENTOR_EMAIL).roles("MENTOR"))
                        .accept(MediaType.APPLICATION_JSON))
                .andReturn()
                .getResponse()
                .getContentAsString();

                Integer blockId = com.jayway.jsonpath.JsonPath.parse(getResponse).read("$.data.bloques[0].idDisponibilidad");

        mockMvc.perform(delete("/api/disponibilidad/mentor/{id}", blockId)
                        .with(user(MENTOR_EMAIL).roles("MENTOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Bloque eliminado correctamente"));

        mockMvc.perform(get("/api/disponibilidad/mentor")
                        .with(user(MENTOR_EMAIL).roles("MENTOR"))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.bloques").isEmpty());
    }

    @Test
    void getMentorAvailability_requiereAutenticacion() throws Exception {
        mockMvc.perform(get("/api/disponibilidad/mentor")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is3xxRedirection());
    }
}
