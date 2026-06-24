package com.pathfinder.service.impl;

import com.pathfinder.dto.response.DisponibilidadDTO;
import com.pathfinder.dto.response.MentorDisponibilidadCompletaDTO;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.enums.RolUsuario;
import com.pathfinder.repository.FeriadoRepository;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.service.DisponibilidadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DisponibilidadServiceTest {

    @Autowired
    private DisponibilidadService disponibilidadService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private FeriadoRepository feriadoRepository;

    private static final String MENTOR_EMAIL = "mentor@test.com";
    private Integer mentorId;

    @BeforeEach
    void setUp() {
        Usuario mentor = new Usuario();
        mentor.setCorreo(MENTOR_EMAIL);
        mentor.setNombreCompleto("Test Mentor");
        mentor.setRol(RolUsuario.MENTOR);
        mentorId = usuarioRepository.save(mentor).getIdUsuario();
    }

    @Test
    void obtenerDisponibilidadCompleta_devuelveDefaultsCuandoNoHayConfig() {
        MentorDisponibilidadCompletaDTO result = disponibilidadService.obtenerDisponibilidadCompleta(MENTOR_EMAIL);

        assertThat(result).isNotNull();
        assertThat(result.getDuracionEntrevista()).isEqualTo(60);
        assertThat(result.getTiempoEntreEntrevistas()).isEqualTo(15);
        assertThat(result.getMaxEntrevistasDia()).isEqualTo(4);
        assertThat(result.getDiasDisponibles()).contains("Lunes", "Miércoles", "Viernes");
        assertThat(result.getBloques()).isEmpty();
    }

    @Test
    void guardarYRecuperarDisponibilidadCompleta() {
        MentorDisponibilidadCompletaDTO dto = MentorDisponibilidadCompletaDTO.builder()
                .duracionEntrevista(30)
                .tiempoEntreEntrevistas(10)
                .maxEntrevistasDia(5)
                .diasDisponibles(List.of("Lunes", "Martes", "Miércoles", "Jueves", "Viernes"))
                .bloques(List.of(
                        DisponibilidadDTO.builder()
                                .diaSemana("Lunes")
                                .horaInicio("09:00")
                                .horaFin("12:00")
                                .tipoEntrevista("virtual")
                                .build(),
                        DisponibilidadDTO.builder()
                                .diaSemana("Miércoles")
                                .horaInicio("14:00")
                                .horaFin("17:00")
                                .tipoEntrevista("presencial")
                                .build()
                ))
                .build();

        disponibilidadService.guardarDisponibilidadCompleta(MENTOR_EMAIL, dto);

        MentorDisponibilidadCompletaDTO result = disponibilidadService.obtenerDisponibilidadCompleta(MENTOR_EMAIL);

        assertThat(result.getDuracionEntrevista()).isEqualTo(30);
        assertThat(result.getTiempoEntreEntrevistas()).isEqualTo(10);
        assertThat(result.getMaxEntrevistasDia()).isEqualTo(5);
        assertThat(result.getDiasDisponibles()).contains("Lunes", "Martes", "Viernes");
        assertThat(result.getBloques()).hasSize(2);
        assertThat(result.getBloques().get(0).getDiaSemana()).isEqualTo("Lunes");
        assertThat(result.getBloques().get(0).getHoraInicio()).isEqualTo("09:00");
        assertThat(result.getBloques().get(0).getHoraFin()).isEqualTo("12:00");
        assertThat(result.getBloques().get(1).getTipoEntrevista()).isEqualTo("presencial");
    }

    @Test
    void eliminarDisponibilidad_softDeleteBloque() {
        MentorDisponibilidadCompletaDTO dto = MentorDisponibilidadCompletaDTO.builder()
                .duracionEntrevista(60)
                .tiempoEntreEntrevistas(15)
                .maxEntrevistasDia(4)
                .diasDisponibles(List.of("Lunes"))
                .bloques(List.of(
                        DisponibilidadDTO.builder()
                                .diaSemana("Lunes")
                                .horaInicio("10:00")
                                .horaFin("11:00")
                                .tipoEntrevista("virtual")
                                .build()
                ))
                .build();

        disponibilidadService.guardarDisponibilidadCompleta(MENTOR_EMAIL, dto);

        MentorDisponibilidadCompletaDTO saved = disponibilidadService.obtenerDisponibilidadCompleta(MENTOR_EMAIL);
        assertThat(saved.getBloques()).hasSize(1);
        Integer blockId = saved.getBloques().get(0).getIdDisponibilidad();

        disponibilidadService.eliminarDisponibilidad(blockId, MENTOR_EMAIL);

        MentorDisponibilidadCompletaDTO afterDelete = disponibilidadService.obtenerDisponibilidadCompleta(MENTOR_EMAIL);
        assertThat(afterDelete.getBloques()).isEmpty();
    }

    @Test
    void eliminarDisponibilidad_lanzaErrorSiNoEsPropietario() {
        Usuario otroMentor = new Usuario();
        otroMentor.setCorreo("otro@test.com");
        otroMentor.setNombreCompleto("Otro Mentor");
        otroMentor.setRol(RolUsuario.MENTOR);
        usuarioRepository.save(otroMentor);

        MentorDisponibilidadCompletaDTO dto = MentorDisponibilidadCompletaDTO.builder()
                .duracionEntrevista(60)
                .tiempoEntreEntrevistas(15)
                .maxEntrevistasDia(4)
                .diasDisponibles(List.of("Lunes"))
                .bloques(List.of(
                        DisponibilidadDTO.builder()
                                .diaSemana("Lunes")
                                .horaInicio("10:00")
                                .horaFin("11:00")
                                .tipoEntrevista("virtual")
                                .build()
                ))
                .build();

        disponibilidadService.guardarDisponibilidadCompleta(MENTOR_EMAIL, dto);
        Integer blockId = disponibilidadService.obtenerDisponibilidadCompleta(MENTOR_EMAIL)
                .getBloques().get(0).getIdDisponibilidad();

        assertThatThrownBy(() -> disponibilidadService.eliminarDisponibilidad(blockId, "otro@test.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No tienes permisos");
    }

    @Test
    void obtenerSlotsDisponibles_generaSlotsCorrectos() {
        MentorDisponibilidadCompletaDTO dto = MentorDisponibilidadCompletaDTO.builder()
                .duracionEntrevista(60)
                .tiempoEntreEntrevistas(15)
                .maxEntrevistasDia(4)
                .diasDisponibles(List.of("Lunes", "Martes", "Miércoles", "Jueves", "Viernes"))
                .bloques(List.of(
                        DisponibilidadDTO.builder()
                                .diaSemana("Lunes")
                                .horaInicio("09:00")
                                .horaFin("12:00")
                                .tipoEntrevista("virtual")
                                .build()
                ))
                .build();

        disponibilidadService.guardarDisponibilidadCompleta(MENTOR_EMAIL, dto);

        LocalDate nextMonday = obtenerLunesNoFeriado();
        List<String> slots = disponibilidadService.obtenerSlotsDisponibles(mentorId, nextMonday.toString());

        assertThat(slots).containsExactly("09:00", "10:15");
    }

    @Test
    void obtenerSlotsDisponibles_devuelveVacioCuandoDiaNoConfigurado() {
        MentorDisponibilidadCompletaDTO dto = MentorDisponibilidadCompletaDTO.builder()
                .duracionEntrevista(60)
                .tiempoEntreEntrevistas(15)
                .maxEntrevistasDia(4)
                .diasDisponibles(List.of("Lunes"))
                .bloques(List.of(
                        DisponibilidadDTO.builder()
                                .diaSemana("Lunes")
                                .horaInicio("09:00")
                                .horaFin("12:00")
                                .tipoEntrevista("virtual")
                                .build()
                ))
                .build();

        disponibilidadService.guardarDisponibilidadCompleta(MENTOR_EMAIL, dto);

        LocalDate nextTuesday = LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.TUESDAY));
        List<String> slots = disponibilidadService.obtenerSlotsDisponibles(mentorId, nextTuesday.toString());

        assertThat(slots).isEmpty();
    }

    @Test
    void obtenerSlotsDisponibles_devuelveVacioCuandoNoHayBloquesParaEseDia() {
        MentorDisponibilidadCompletaDTO dto = MentorDisponibilidadCompletaDTO.builder()
                .duracionEntrevista(60)
                .tiempoEntreEntrevistas(15)
                .maxEntrevistasDia(4)
                .diasDisponibles(List.of("Lunes", "Miércoles"))
                .bloques(List.of(
                        DisponibilidadDTO.builder()
                                .diaSemana("Miércoles")
                                .horaInicio("09:00")
                                .horaFin("12:00")
                                .tipoEntrevista("virtual")
                                .build()
                ))
                .build();

        disponibilidadService.guardarDisponibilidadCompleta(MENTOR_EMAIL, dto);

        LocalDate nextMonday = obtenerLunesNoFeriado();
        List<String> slots = disponibilidadService.obtenerSlotsDisponibles(mentorId, nextMonday.toString());

        assertThat(slots).isEmpty();
    }

    @Test
    void obtenerSlotsDisponibles_generaSlotsHasta22h() {
        MentorDisponibilidadCompletaDTO dto = MentorDisponibilidadCompletaDTO.builder()
                .duracionEntrevista(60)
                .tiempoEntreEntrevistas(0)
                .maxEntrevistasDia(8)
                .diasDisponibles(List.of("Lunes"))
                .bloques(List.of(
                        DisponibilidadDTO.builder()
                                .diaSemana("Lunes")
                                .horaInicio("21:00")
                                .horaFin("22:00")
                                .tipoEntrevista("virtual")
                                .build()
                ))
                .build();

        disponibilidadService.guardarDisponibilidadCompleta(MENTOR_EMAIL, dto);

        LocalDate nextMonday = obtenerLunesNoFeriado();
        List<String> slots = disponibilidadService.obtenerSlotsDisponibles(mentorId, nextMonday.toString());

        assertThat(slots).containsExactly("21:00");
    }

    private LocalDate obtenerLunesNoFeriado() {
        LocalDate date = LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        while (feriadoRepository.existsByFechaAndActivoTrue(date)) {
            date = date.plusWeeks(1);
        }
        return date;
    }
}
