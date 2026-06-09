package com.pathfinder.service.impl;

import com.pathfinder.dto.request.AgendarEntrevistaRequest;
import com.pathfinder.dto.response.EntrevistaResponseDTO;
import com.pathfinder.model.entity.*;
import com.pathfinder.model.enums.*;
import com.pathfinder.repository.*;
import com.pathfinder.service.EmailService;
import com.pathfinder.service.EntrevistaService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EntrevistaServiceImpl implements EntrevistaService {

    private final EntrevistaRepository entrevistaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProgresoEstudianteRepository progresoRepository;
    private final ResultadoDISCRepository resultadoDISCRepository;
    private final PerfilCVRepository perfilCVRepository;
    private final EmailService emailService;
    private final FeriadoRepository feriadoRepository;


    @Override
    @Transactional
    public EntrevistaResponseDTO agendarEntrevista(String correoEstudiante, AgendarEntrevistaRequest request) {
        Usuario estudiante = usuarioRepository.findByCorreo(correoEstudiante)
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado"));

        Usuario mentor = usuarioRepository.findById(request.getIdMentor())
                .orElseThrow(() -> new IllegalArgumentException("Mentor no encontrado"));

        if (mentor.getRol() != RolUsuario.MENTOR) {
            throw new IllegalArgumentException("El usuario seleccionado no es un mentor válido");
        }

        // Validar si el estudiante ya tiene una entrevista programada activa
        boolean yaAgendada = entrevistaRepository.existsByEstudiante_IdUsuarioAndEstadoAndActivoTrue(estudiante.getIdUsuario(), "Programada");
        if (yaAgendada) {
            throw new IllegalStateException("Ya tienes una entrevista programada activa");
        }

        LocalDate fecha = LocalDate.parse(request.getFecha());

        // Validar si la fecha es feriado
        if (feriadoRepository.existsByFechaAndActivoTrue(fecha)) {
            throw new IllegalStateException("La fecha seleccionada es un día feriado nacional y no laborable.");
        }

        // Validar colisión de horario para el mentor

        boolean colision = entrevistaRepository.existsByMentor_IdUsuarioAndFechaAndHoraAndActivoTrue(mentor.getIdUsuario(), fecha, request.getHora());
        if (colision) {
            throw new IllegalStateException("El horario seleccionado ya no está disponible con este mentor");
        }

        // Crear entrevista
        Entrevista entrevista = new Entrevista();
        entrevista.setEstudiante(estudiante);
        entrevista.setMentor(mentor);
        entrevista.setFecha(fecha);
        entrevista.setHora(request.getHora());
        entrevista.setTipo(request.getTipo());
        entrevista.setEstado("Programada");
        entrevista.setActivo(true);
        entrevista.setPuesto(request.getPuesto() != null ? request.getPuesto().trim() : null);

        Entrevista guardada = entrevistaRepository.save(entrevista);

        // Actualizar progreso del estudiante
        actualizarProgreso(estudiante, NombreEtapa.AGENDAMIENTO_ENTREVISTA, EstadoEtapa.COMPLETADA);
        actualizarProgreso(estudiante, NombreEtapa.EVALUACION_ENTREVISTA, EstadoEtapa.EN_PROGRESO);

        // Enviar correo de confirmación (inicialmente sin enlace)
        boolean emailSent = emailService.enviarCorreoConfirmacion(
                estudiante.getCorreo(),
                estudiante.getNombreCompleto(),
                mentor.getNombreCompleto(),
                request.getFecha(),
                request.getHora(),
                request.getTipo(),
                null
        );

        log.info("Entrevista agendada con éxito para estudiante {} con mentor {}", correoEstudiante, mentor.getCorreo());
        EntrevistaResponseDTO dto = mapToDTO(guardada);
        dto.setEmailEnviado(emailSent);
        return dto;
    }

    @Override
    public EntrevistaResponseDTO obtenerEntrevistaActivaEstudiante(String correoEstudiante) {
        Entrevista entrevista = entrevistaRepository.findFirstByEstudiante_CorreoAndActivoTrueOrderByFechaDescHoraDesc(correoEstudiante)
                .orElseThrow(() -> new IllegalArgumentException("No tienes entrevistas registradas"));

        return mapToDTO(entrevista);
    }

    @Override
    public List<EntrevistaResponseDTO> obtenerEntrevistasMentor(String correoMentor) {
        List<Entrevista> entrevistas = entrevistaRepository.findByMentor_Correo(correoMentor);
        return entrevistas.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean guardarEnlaceVirtual(Integer idEntrevista, String correoMentor, String virtualLink) {
        Entrevista entrevista = entrevistaRepository.findById(idEntrevista)
                .orElseThrow(() -> new IllegalArgumentException("Entrevista no encontrada"));

        if (!entrevista.getMentor().getCorreo().equals(correoMentor)) {
            throw new IllegalStateException("No tienes permisos para modificar esta entrevista");
        }

        String link = virtualLink.trim();
        if (!link.toLowerCase().startsWith("http://") && !link.toLowerCase().startsWith("https://")) {
            link = "https://" + link;
        }

        String urlLower = link.toLowerCase();
        boolean isValid = urlLower.contains("zoom.us") ||
                          urlLower.contains("meet.google.com") ||
                          urlLower.contains("teams.microsoft.com") ||
                          urlLower.contains("teams.live.com") ||
                          urlLower.contains("join.skype.com") ||
                          urlLower.contains("webex.com") ||
                          urlLower.contains("meet.jit.si");

        if (!isValid) {
            throw new IllegalArgumentException("El enlace de la reunión no es válido. Debe ser de Zoom, Google Meet, Teams, Skype, Webex o Jitsi.");
        }

        entrevista.setVirtualLink(link);
        entrevista.setFechaModificacion(LocalDateTime.now());
        entrevistaRepository.save(entrevista);

        // Notificar al estudiante por correo
        boolean emailSent = emailService.enviarCorreoConfirmacion(
                entrevista.getEstudiante().getCorreo(),
                entrevista.getEstudiante().getNombreCompleto(),
                entrevista.getMentor().getNombreCompleto(),
                entrevista.getFecha().toString(),
                entrevista.getHora(),
                entrevista.getTipo(),
                link
        );

        log.info("Enlace virtual guardado para entrevista ID {}", idEntrevista);
        return emailSent;
    }

    @Override
    @Transactional
    public void guardarFeedback(Integer idEntrevista, String correoMentor, String resultado, String feedback, Integer comunicacion, Integer tecnica, Integer proactividad, Integer resolucion) {
        Entrevista entrevista = entrevistaRepository.findById(idEntrevista)
                .orElseThrow(() -> new IllegalArgumentException("Entrevista no encontrada"));

        if (!entrevista.getMentor().getCorreo().equals(correoMentor)) {
            throw new IllegalStateException("No tienes permisos para evaluar esta entrevista");
        }

        entrevista.setResultado(resultado);
        entrevista.setFeedbackComentarios(feedback);
        entrevista.setCompetenciaComunicacion(comunicacion);
        entrevista.setCompetenciaTecnica(tecnica);
        entrevista.setCompetenciaProactividad(proactividad);
        entrevista.setCompetenciaResolucion(resolucion);
        entrevista.setEstado("Completada");
        entrevista.setFechaModificacion(LocalDateTime.now());
        
        entrevistaRepository.save(entrevista);

        // Actualizar etapa de evaluación del estudiante como COMPLETADA
        actualizarProgreso(entrevista.getEstudiante(), NombreEtapa.EVALUACION_ENTREVISTA, EstadoEtapa.COMPLETADA);

        log.info("Feedback registrado para entrevista ID {}", idEntrevista);
    }

    @Override
    @Transactional
    public void cancelarOReagendarEntrevistaEstudiante(String correoEstudiante, String motivo, boolean esReagendado) {
        Entrevista entrevista = entrevistaRepository.findFirstByEstudiante_CorreoAndActivoTrueOrderByFechaDescHoraDesc(correoEstudiante)
                .orElseThrow(() -> new IllegalArgumentException("No tienes ninguna entrevista activa para cancelar o reagendar"));

        if (!"Programada".equalsIgnoreCase(entrevista.getEstado())) {
            throw new IllegalStateException("Solo puedes cancelar o reagendar una entrevista que esté en estado 'Programada'");
        }

        String nuevoEstado = esReagendado ? "Reagendada" : "Cancelada";
        entrevista.setEstado(nuevoEstado);
        entrevista.setActivo(false);
        entrevista.setMotivoCancelacion(motivo);
        entrevista.setFechaModificacion(LocalDateTime.now());
        entrevistaRepository.save(entrevista);

        // Actualizar progreso del estudiante para permitir agendar nuevamente
        Usuario estudiante = entrevista.getEstudiante();
        actualizarProgreso(estudiante, NombreEtapa.AGENDAMIENTO_ENTREVISTA, EstadoEtapa.EN_PROGRESO);
        actualizarProgreso(estudiante, NombreEtapa.EVALUACION_ENTREVISTA, EstadoEtapa.PENDIENTE);

        // Notificar por correo real tanto al estudiante como al mentor
        emailService.enviarCorreoCancelacionOReagendacion(
                estudiante.getCorreo(),
                estudiante.getNombreCompleto(),
                entrevista.getMentor().getNombreCompleto(),
                entrevista.getFecha().toString(),
                entrevista.getHora(),
                nuevoEstado,
                motivo
        );

        emailService.enviarCorreoCancelacionOReagendacion(
                entrevista.getMentor().getCorreo(),
                estudiante.getNombreCompleto(),
                entrevista.getMentor().getNombreCompleto(),
                entrevista.getFecha().toString(),
                entrevista.getHora(),
                nuevoEstado,
                motivo
        );

        log.info("Entrevista ID {} cambiada a {} por el estudiante {}. Motivo: {}", 
                entrevista.getIdEntrevista(), nuevoEstado, correoEstudiante, motivo);
    }

    private void actualizarProgreso(Usuario usuario, NombreEtapa etapa, EstadoEtapa estado) {
        ProgresoEstudiante p = progresoRepository.findByUsuario_IdUsuarioAndNombreEtapa(usuario.getIdUsuario(), etapa)
                .orElseGet(() -> {
                    ProgresoEstudiante nuevo = new ProgresoEstudiante();
                    nuevo.setUsuario(usuario);
                    nuevo.setNombreEtapa(etapa);
                    return nuevo;
                });
        p.setEstadoEtapa(estado);
        if (estado == EstadoEtapa.COMPLETADA) {
            p.setFechaCompletada(LocalDateTime.now());
        }
        progresoRepository.save(p);
    }

    private EntrevistaResponseDTO mapToDTO(Entrevista ent) {
        // Buscar DISC
        Optional<ResultadoDISC> discOpt = resultadoDISCRepository.findFirstByUsuario_IdUsuarioOrderByFechaFinalizacionDesc(ent.getEstudiante().getIdUsuario());
        String discPerfil = discOpt.map(ResultadoDISC::getPerfilDominante).orElse(null);
        String discNombre = discOpt.map(d -> "Perfil Dominante: " + d.getPerfilDominante()).orElse("No disponible");

        // Buscar CV
        boolean cvAvailable = perfilCVRepository.existsByUsuario_Correo(ent.getEstudiante().getCorreo());

        // Calcular promedio de calificación (1 decimal)
        Double promedio = null;
        if (ent.getCompetenciaComunicacion() != null && ent.getCompetenciaTecnica() != null &&
            ent.getCompetenciaProactividad() != null && ent.getCompetenciaResolucion() != null) {
            double avg = (ent.getCompetenciaComunicacion() + ent.getCompetenciaTecnica() +
                          ent.getCompetenciaProactividad() + ent.getCompetenciaResolucion()) / 4.0;
            promedio = Math.round(avg * 10.0) / 10.0;
        }

        // Nombres de competencias dinámicos
        java.util.Map<String, String> nombresCompetencias = new java.util.HashMap<>();
        nombresCompetencias.put("competenciaComunicacion", "Comunicación");
        nombresCompetencias.put("competenciaTecnica", "Habilidades Técnicas");
        nombresCompetencias.put("competenciaProactividad", "Calificación General");
        nombresCompetencias.put("competenciaResolucion", "Resolución de Problemas");

        String puesto = ent.getPuesto();
        if (puesto == null || puesto.trim().isEmpty()) {
            Optional<PerfilCV> cvOpt = perfilCVRepository.findByUsuario_Correo(ent.getEstudiante().getCorreo());
            puesto = cvOpt.map(PerfilCV::getInteresesProfesionales).orElse(null);
        }
        if (puesto == null || puesto.trim().isEmpty()) {
            puesto = "Sin especificar";
        }

        return EntrevistaResponseDTO.builder()
                .idEntrevista(ent.getIdEntrevista())
                .idEstudiante(ent.getEstudiante().getIdUsuario())
                .estudianteNombre(ent.getEstudiante().getNombreCompleto())
                .estudianteEmail(ent.getEstudiante().getCorreo())
                .idMentor(ent.getMentor().getIdUsuario())
                .mentorNombre(ent.getMentor().getNombreCompleto())
                .mentorEmail(ent.getMentor().getCorreo())
                .fecha(ent.getFecha().toString())
                .hora(ent.getHora())
                .tipo(ent.getTipo())
                .estado(ent.getEstado())
                .virtualLink(ent.getVirtualLink())
                .discPerfilDominante(discPerfil)
                .discNombrePerfil(discNombre)
                .cvAvailable(cvAvailable)
                .resultado(ent.getResultado())
                .feedbackComentarios(ent.getFeedbackComentarios())
                .competenciaComunicacion(ent.getCompetenciaComunicacion())
                .competenciaTecnica(ent.getCompetenciaTecnica())
                .competenciaProactividad(ent.getCompetenciaProactividad())
                .competenciaResolucion(ent.getCompetenciaResolucion())
                .motivoCancelacion(ent.getMotivoCancelacion())
                .promedioCalificacion(promedio)
                .nombresCompetencias(nombresCompetencias)
                .puesto(puesto)
                .build();
    }
}
