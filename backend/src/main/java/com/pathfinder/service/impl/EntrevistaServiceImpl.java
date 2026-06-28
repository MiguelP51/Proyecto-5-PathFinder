package com.pathfinder.service.impl;

import com.pathfinder.dto.request.AgendarEntrevistaRequest;
import com.pathfinder.dto.request.ReprogramarEntrevistaRequest;
import com.pathfinder.dto.response.CompetenciaMetricDTO;
import com.pathfinder.dto.response.EntrevistaResponseDTO;
import com.pathfinder.dto.response.FeedbackRecentDTO;
import com.pathfinder.dto.response.MentorMetricsResponseDTO;
import com.pathfinder.dto.response.MonthlyMetricDTO;
import com.pathfinder.model.entity.*;
import com.pathfinder.model.enums.*;
import com.pathfinder.repository.*;
import com.pathfinder.service.EmailService;
import com.pathfinder.service.EntrevistaService;
import com.pathfinder.service.NotificacionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
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
    private final NotificacionService notificacionService;
    private final ConfiguracionDisponibilidadMentorRepository configuracionDisponibilidadMentorRepository;


    @Override
    @Transactional
    public EntrevistaResponseDTO agendarEntrevista(String correoEstudiante, AgendarEntrevistaRequest request) {
        if (request.getPuesto() == null || request.getPuesto().trim().isEmpty()) {
            throw new IllegalArgumentException("El puesto al que postulas es obligatorio");
        }

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

        // Notificación al mentor
        String fechaStr = request.getFecha();
        notificacionService.crearNotificacion(
                "NUEVA_ENTREVISTA",
                estudiante.getNombreCompleto() + " agendó una entrevista para el " + fechaStr + " a las " + request.getHora(),
                mentor.getCorreo(),
                guardada.getIdEntrevista()
        );

        // Notificación al estudiante
        notificacionService.crearNotificacion(
                "ENTREVISTA_AGENDADA",
                "Tu entrevista con " + mentor.getNombreCompleto() + " está programada para el " + fechaStr + " a las " + request.getHora(),
                estudiante.getCorreo(),
                guardada.getIdEntrevista()
        );

        // Enviar correo de confirmación al estudiante (inicialmente sin enlace)
        boolean emailSentEstudiante = emailService.enviarCorreoConfirmacion(
                estudiante.getCorreo(),
                estudiante.getNombreCompleto(),
                mentor.getNombreCompleto(),
                mentor.getCorreo(),
                request.getFecha(),
                request.getHora(),
                request.getTipo(),
                null
        );

        // Enviar correo de confirmación al mentor
        boolean emailSentMentor = emailService.enviarCorreoConfirmacionMentor(
                mentor.getCorreo(),
                estudiante.getNombreCompleto(),
                mentor.getNombreCompleto(),
                request.getFecha(),
                request.getHora(),
                request.getTipo()
        );

        boolean emailSent = emailSentEstudiante && emailSentMentor;

        log.info("Entrevista agendada con éxito para estudiante {} (correo enviado: {}) y mentor {} (correo enviado: {})", 
                correoEstudiante, emailSentEstudiante, mentor.getCorreo(), emailSentMentor);
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

        // Notificar al estudiante por base de datos/WebSocket
        notificacionService.crearNotificacion(
                "ENLACE_ENTREVISTA",
                "El enlace virtual para tu entrevista con " + entrevista.getMentor().getNombreCompleto() + " ya está disponible.",
                entrevista.getEstudiante().getCorreo(),
                entrevista.getIdEntrevista()
        );

        // Notificar al estudiante por correo
        boolean emailSent = emailService.enviarCorreoConfirmacion(
                entrevista.getEstudiante().getCorreo(),
                entrevista.getEstudiante().getNombreCompleto(),
                entrevista.getMentor().getNombreCompleto(),
                entrevista.getMentor().getCorreo(),
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
    public void guardarFeedback(Integer idEntrevista, String correoMentor, com.pathfinder.dto.request.GuardarFeedbackRequest request) {
        Entrevista entrevista = entrevistaRepository.findById(idEntrevista)
                .orElseThrow(() -> new IllegalArgumentException("Entrevista no encontrada"));

        if (!entrevista.getMentor().getCorreo().equals(correoMentor)) {
            throw new IllegalStateException("No tienes permisos para evaluar esta entrevista");
        }

        entrevista.setResultado(request.getResultado());
        entrevista.setFeedbackComentarios(request.getFeedbackComentarios());
        
        // Mantener legacy para compatibilidad si están presentes
        if (request.getCompetenciaComunicacion() != null) {
            entrevista.setCompetenciaComunicacion(request.getCompetenciaComunicacion());
        }
        if (request.getCompetenciaTecnica() != null) {
            entrevista.setCompetenciaTecnica(request.getCompetenciaTecnica());
        }
        if (request.getCompetenciaProactividad() != null) {
            entrevista.setCompetenciaProactividad(request.getCompetenciaProactividad());
        }
        if (request.getCompetenciaResolucion() != null) {
            entrevista.setCompetenciaResolucion(request.getCompetenciaResolucion());
        }

        entrevista.setEstado("Completada");
        entrevista.setFechaModificacion(LocalDateTime.now());

        // Guardar competencias evaluadas dinámicas
        if (entrevista.getCompetenciasEvaluadas() == null) {
            entrevista.setCompetenciasEvaluadas(new java.util.ArrayList<>());
        } else {
            entrevista.getCompetenciasEvaluadas().clear();
        }

        if (request.getCompetenciasEvaluadas() != null) {
            for (com.pathfinder.dto.request.GuardarFeedbackRequest.CompetenciaEvaluadaDTO compDto : request.getCompetenciasEvaluadas()) {
                EntrevistaCompetencia ec = new EntrevistaCompetencia();
                ec.setEntrevista(entrevista);
                ec.setNombreCompetencia(compDto.getNombreCompetencia());
                ec.setNivelSeleccionado(compDto.getNivelSeleccionado());
                ec.setDescripcionNivel(compDto.getDescripcionNivel());
                ec.setActivo(true);
                ec.setFechaRegistro(LocalDateTime.now());
                entrevista.getCompetenciasEvaluadas().add(ec);
            }
        }
        
        entrevistaRepository.save(entrevista);

        // Actualizar etapa de evaluación del estudiante como COMPLETADA
        actualizarProgreso(entrevista.getEstudiante(), NombreEtapa.EVALUACION_ENTREVISTA, EstadoEtapa.COMPLETADA);

        // Notificación al mentor (feedback completado)
        notificacionService.crearNotificacion(
                "ENTREVISTA_COMPLETADA",
                "Entrevista completada con " + entrevista.getEstudiante().getNombreCompleto(),
                correoMentor,
                idEntrevista
        );

        // Notificación al estudiante (feedback completado/disponible)
        notificacionService.crearNotificacion(
                "FEEDBACK_DISPONIBLE",
                entrevista.getMentor().getNombreCompleto() + " dejó comentarios sobre tu entrevista. Revisa tus áreas de mejora.",
                entrevista.getEstudiante().getCorreo(),
                idEntrevista
        );

        log.info("Feedback registrado para entrevista ID {}", idEntrevista);
    }

    @Override
    @Transactional
    public void cancelarOReagendarEntrevistaEstudiante(String correoEstudiante, String motivo, boolean esReagendado) {
        Entrevista entrevista = entrevistaRepository.findFirstByEstudiante_CorreoAndActivoTrueOrderByFechaDescHoraDesc(correoEstudiante)
                .orElseThrow(() -> new IllegalArgumentException("No tienes ninguna entrevista activa para cancelar o reagendar"));

        if (!"Programada".equalsIgnoreCase(entrevista.getEstado()) && !"Reagendada".equalsIgnoreCase(entrevista.getEstado())) {
            throw new IllegalStateException("Solo puedes cancelar o reagendar una entrevista que esté en estado 'Programada' o 'Reagendada'");
        }

        java.time.LocalDateTime fechaHoraCita = java.time.LocalDateTime.of(entrevista.getFecha(), java.time.LocalTime.parse(entrevista.getHora()));
        if (java.time.LocalDateTime.now().isAfter(fechaHoraCita.minusHours(24))) {
            throw new IllegalStateException("Solo puedes cancelar o reagendar la cita con un mínimo de 24 horas de anticipación.");
        }

        String nuevoEstado = esReagendado ? "Reagendada" : "Cancelada";
        entrevista.setEstado(nuevoEstado);
        entrevista.setActivo(false);
        entrevista.setMotivoCancelacion(motivo);
        entrevista.setFechaModificacion(LocalDateTime.now());
        entrevistaRepository.save(entrevista);

        Usuario estudiante = entrevista.getEstudiante();
        actualizarProgreso(estudiante, NombreEtapa.AGENDAMIENTO_ENTREVISTA, EstadoEtapa.EN_PROGRESO);
        actualizarProgreso(estudiante, NombreEtapa.EVALUACION_ENTREVISTA, EstadoEtapa.PENDIENTE);

        String tipoNotif = esReagendado ? "REAGENDACION" : "CANCELACION";
        String mensajeNotif = esReagendado
                ? estudiante.getNombreCompleto() + " reagendó la entrevista del " + entrevista.getFecha()
                : estudiante.getNombreCompleto() + " canceló la entrevista del " + entrevista.getFecha();
        notificacionService.crearNotificacion(
                tipoNotif,
                mensajeNotif,
                entrevista.getMentor().getCorreo(),
                entrevista.getIdEntrevista()
        );

        notificacionService.crearNotificacion(
                esReagendado ? "ENTREVISTA_REAGENDADA" : "ENTREVISTA_CANCELADA",
                "Tu entrevista del " + entrevista.getFecha() + " fue " + nuevoEstado.toLowerCase() + " con éxito.",
                estudiante.getCorreo(),
                entrevista.getIdEntrevista()
        );

        try {
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
        } catch (Exception e) {
            log.error("Error al enviar correos de cancelación/reagendamiento del estudiante: {}", e.getMessage(), e);
        }

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
        if (ent.getCompetenciasEvaluadas() != null && !ent.getCompetenciasEvaluadas().isEmpty()) {
            double sumVal = 0;
            for (EntrevistaCompetencia ec : ent.getCompetenciasEvaluadas()) {
                sumVal += ec.getNivelSeleccionado();
            }
            double avg = sumVal / ent.getCompetenciasEvaluadas().size();
            // Normalizar escala de competencias dinámicas (0-3) a la escala de visualización (1-5) para que coincida con el máximo de 5.0/5.0
            avg = 1.0 + (avg / 3.0) * 4.0;
            promedio = Math.round(avg * 10.0) / 10.0;
        } else if (ent.getCompetenciaComunicacion() != null && ent.getCompetenciaTecnica() != null &&
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

        // Mapear competencias dinámicas evaluadas
        List<EntrevistaResponseDTO.CompetenciaEvaluadaResponseDTO> compsMapped = new java.util.ArrayList<>();
        if (ent.getCompetenciasEvaluadas() != null && !ent.getCompetenciasEvaluadas().isEmpty()) {
            compsMapped = ent.getCompetenciasEvaluadas().stream()
                    .map(c -> EntrevistaResponseDTO.CompetenciaEvaluadaResponseDTO.builder()
                            .nombreCompetencia(c.getNombreCompetencia())
                            .nivelSeleccionado(c.getNivelSeleccionado())
                            .descripcionNivel(c.getDescripcionNivel())
                            .build())
                    .collect(Collectors.toList());
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
                .competenciasEvaluadas(compsMapped)
                .build();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void archivarEntrevistasEstudiante(String correoEstudiante) {
        List<Entrevista> activeInterviews = entrevistaRepository.findByEstudiante_CorreoAndActivoTrue(correoEstudiante);
        for (Entrevista ent : activeInterviews) {
            ent.setActivo(false);
            ent.setFechaModificacion(java.time.LocalDateTime.now());
        }
        entrevistaRepository.saveAll(activeInterviews);
    }

    @Override
    @Transactional
    public EntrevistaResponseDTO reprogramar(Integer idEntrevista, String correoMentor, ReprogramarEntrevistaRequest request) {
        Entrevista entrevista = entrevistaRepository.findById(idEntrevista)
                .orElseThrow(() -> new IllegalArgumentException("Entrevista no encontrada"));

        if (!entrevista.getMentor().getCorreo().equals(correoMentor)) {
            throw new IllegalStateException("No tienes permisos para reprogramar esta entrevista");
        }

        if (!"Programada".equals(entrevista.getEstado())) {
            throw new IllegalStateException("Solo se puede reprogramar una entrevista en estado 'Programada'");
        }

        if (entrevista.getFeedbackComentarios() != null && !entrevista.getFeedbackComentarios().trim().isEmpty()) {
            throw new IllegalStateException("No puedes reprogramar esta entrevista porque ya has registrado tu evaluación");
        }

        LocalDate nuevaFecha = LocalDate.parse(request.getNuevaFecha());
        String nuevaHora = request.getNuevaHora();

        if (nuevaFecha.isBefore(LocalDate.now())) {
            throw new IllegalStateException("No se puede reprogramar a una fecha pasada");
        }

        if (feriadoRepository.existsByFechaAndActivoTrue(nuevaFecha)) {
            throw new IllegalStateException("La fecha seleccionada es un día feriado. Por favor, elige otra fecha");
        }

        boolean colision = entrevistaRepository.existsByMentor_IdUsuarioAndFechaAndHoraAndActivoTrue(
                entrevista.getMentor().getIdUsuario(), nuevaFecha, nuevaHora);
        if (colision) {
            throw new IllegalStateException("El horario seleccionado ya no está disponible");
        }

        entrevista.setFecha(nuevaFecha);
        entrevista.setHora(nuevaHora);
        entrevista.setEstado("Reagendada");
        entrevista.setFechaModificacion(LocalDateTime.now());
        entrevistaRepository.save(entrevista);

        // Notificar al estudiante
        notificacionService.crearNotificacion(
                "REAGENDACION",
                "Tu entrevista con " + entrevista.getMentor().getNombreCompleto()
                        + " ha sido reprogramada para el " + nuevaFecha + " a las " + nuevaHora,
                entrevista.getEstudiante().getCorreo(),
                entrevista.getIdEntrevista()
        );

        // Notificar al mentor como confirmación
        notificacionService.crearNotificacion(
                "ENTREVISTA_REPROGRAMADA",
                "Has reprogramado la entrevista con " + entrevista.getEstudiante().getNombreCompleto()
                        + " para el " + nuevaFecha + " a las " + nuevaHora,
                correoMentor,
                entrevista.getIdEntrevista()
        );

        // Notificar por correo real tanto al estudiante como al mentor
        try {
            emailService.enviarCorreoCancelacionOReagendacion(
                    entrevista.getEstudiante().getCorreo(),
                    entrevista.getEstudiante().getNombreCompleto(),
                    entrevista.getMentor().getNombreCompleto(),
                    nuevaFecha.toString(),
                    nuevaHora,
                    "Reprogramada",
                    "La fecha y hora de la simulación de entrevista fueron actualizadas por el PathMentor."
            );
            emailService.enviarCorreoCancelacionOReagendacion(
                    entrevista.getMentor().getCorreo(),
                    entrevista.getEstudiante().getNombreCompleto(),
                    entrevista.getMentor().getNombreCompleto(),
                    nuevaFecha.toString(),
                    nuevaHora,
                    "Reprogramada",
                    "La fecha y hora de la simulación de entrevista fueron actualizadas por el PathMentor."
            );
        } catch (Exception e) {
            log.error("Error al enviar correos de reprogramación: {}", e.getMessage());
        }

        log.info("Entrevista ID {} reprogramada por mentor {}: nueva fecha {}, nueva hora {}",
                idEntrevista, correoMentor, nuevaFecha, nuevaHora);

        return mapToDTO(entrevista);
    }

    @Override
    public MentorMetricsResponseDTO obtenerMetricas(String correoMentor, String periodo) {
        Usuario mentor = usuarioRepository.findByCorreo(correoMentor)
                .orElseThrow(() -> new IllegalArgumentException("Mentor no encontrado"));

        List<Entrevista> todas = entrevistaRepository.findByMentor_CorreoAndActivoTrue(correoMentor);

        LocalDate ahora = LocalDate.now();
        LocalDate desde;
        if ("mes".equalsIgnoreCase(periodo)) {
            desde = ahora.withDayOfMonth(1);
        } else if ("3meses".equalsIgnoreCase(periodo)) {
            desde = ahora.minusMonths(3).withDayOfMonth(1);
        } else {
            desde = ahora.withDayOfYear(1);
        }

        List<Entrevista> filtradas = todas.stream()
                .filter(e -> !e.getFecha().isBefore(desde))
                .collect(Collectors.toList());

        int realizadas = (int) filtradas.stream().filter(e -> "Completada".equals(e.getEstado())).count();
        int pendientes = (int) filtradas.stream().filter(e -> "Programada".equals(e.getEstado())).count();

        Double calificacionPromedio = calcularPromedioCalificacion(filtradas);

        Integer tiempoPromedio = configuracionDisponibilidadMentorRepository
                .findByMentor_CorreoAndActivoTrue(correoMentor)
                .map(ConfiguracionDisponibilidadMentor::getDuracionEntrevista)
                .orElse(null);

        List<MonthlyMetricDTO> desempenioMensual = agruparPorMes(filtradas);
        List<CompetenciaMetricDTO> evaluacionCompetencias = calcularCompetencias(filtradas);

        List<FeedbackRecentDTO> evaluacionesRecientes = filtradas.stream()
                .filter(e -> "Completada".equals(e.getEstado()) && e.getResultado() != null)
                .sorted(Comparator.comparing(Entrevista::getFecha).reversed()
                        .thenComparing(Comparator.comparing(Entrevista::getFechaModificacion,
                                Comparator.nullsLast(Comparator.reverseOrder()))))
                .limit(5)
                .map(e -> FeedbackRecentDTO.builder()
                        .estudianteNombre(e.getEstudiante().getNombreCompleto())
                        .fecha(e.getFecha().toString())
                        .puntaje(calcularPromedioEntrevista(e))
                        .resultado(e.getResultado())
                        .build())
                .collect(Collectors.toList());

        int totalCompletadas = (int) todas.stream().filter(e -> "Completada".equals(e.getEstado())).count();
        long aprobadas = todas.stream()
                .filter(e -> "Completada".equals(e.getEstado()) && "Alta".equals(e.getResultado()))
                .count();
        Double tasaAprobacion = totalCompletadas > 0
                ? Math.round((double) aprobadas / totalCompletadas * 100.0 * 10.0) / 10.0
                : 0.0;
        Double calificacionGlobal = calcularPromedioCalificacion(todas);

        return MentorMetricsResponseDTO.builder()
                .entrevistasRealizadas(realizadas)
                .entrevistasPendientes(pendientes)
                .tiempoPromedioMinutos(tiempoPromedio)
                .calificacionPromedio(calificacionPromedio)
                .desempenioMensual(desempenioMensual)
                .evaluacionCompetencias(evaluacionCompetencias)
                .evaluacionesRecientes(evaluacionesRecientes)
                .totalEntrevistas(totalCompletadas)
                .tasaAprobacion(tasaAprobacion)
                .calificacionGlobal(calificacionGlobal)
                .build();
    }

    private Double calcularPromedioCalificacion(List<Entrevista> entrevistas) {
        List<Entrevista> completadas = entrevistas.stream()
                .filter(e -> "Completada".equals(e.getEstado()))
                .collect(Collectors.toList());
        if (completadas.isEmpty()) return 0.0;
        double sum = 0;
        for (Entrevista e : completadas) {
            Double avg = calcularPromedioEntrevista(e);
            if (avg != null) sum += avg;
        }
        return Math.round((sum / completadas.size()) * 10.0) / 10.0;
    }

    private Double calcularPromedioEntrevista(Entrevista ent) {
        if (ent.getCompetenciasEvaluadas() != null && !ent.getCompetenciasEvaluadas().isEmpty()) {
            double sumVal = 0;
            for (EntrevistaCompetencia ec : ent.getCompetenciasEvaluadas()) {
                sumVal += ec.getNivelSeleccionado();
            }
            double avg = sumVal / ent.getCompetenciasEvaluadas().size();
            // Normalize 0-3 scale to 1-5 scale
            avg = 1.0 + (avg / 3.0) * 4.0;
            return Math.round(avg * 10.0) / 10.0;
        } else if (ent.getCompetenciaComunicacion() != null && ent.getCompetenciaTecnica() != null &&
                ent.getCompetenciaProactividad() != null && ent.getCompetenciaResolucion() != null) {
            double avg = (ent.getCompetenciaComunicacion() + ent.getCompetenciaTecnica() +
                          ent.getCompetenciaProactividad() + ent.getCompetenciaResolucion()) / 4.0;
            return Math.round(avg * 10.0) / 10.0;
        }
        return null;
    }

    private List<MonthlyMetricDTO> agruparPorMes(List<Entrevista> entrevistas) {
        Map<String, List<Entrevista>> porMes = new LinkedHashMap<>();
        for (Entrevista e : entrevistas) {
            if (!"Completada".equals(e.getEstado())) continue;
            String key = e.getFecha().getYear() + "-" + String.format("%02d", e.getFecha().getMonthValue());
            porMes.computeIfAbsent(key, k -> new ArrayList<>()).add(e);
        }

        String[] meses = {"", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                          "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"};

        return porMes.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    int anio = Integer.parseInt(entry.getKey().split("-")[0]);
                    int mes = Integer.parseInt(entry.getKey().split("-")[1]);
                    List<Entrevista> lista = entry.getValue();
                    int count = lista.size();
                    double sumScore = 0;
                    int scoreCount = 0;
                    for (Entrevista e : lista) {
                        Double avg = calcularPromedioEntrevista(e);
                        if (avg != null) {
                            sumScore += avg;
                            scoreCount++;
                        }
                    }
                    double avgScore = scoreCount > 0 ? Math.round((sumScore / scoreCount) * 10.0) / 10.0 : 0.0;
                    Integer duracion = configuracionDisponibilidadMentorRepository
                            .findByMentor_CorreoAndActivoTrue(entrevistas.get(0).getMentor().getCorreo())
                            .map(ConfiguracionDisponibilidadMentor::getDuracionEntrevista)
                            .orElse(0);
                    return MonthlyMetricDTO.builder()
                            .mes(mes)
                            .anio(anio)
                            .nombreMes(meses[mes])
                            .entrevistas(count)
                            .tiempoPromedio(duracion)
                            .calificacionPromedio(avgScore)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<CompetenciaMetricDTO> calcularCompetencias(List<Entrevista> entrevistas) {
        List<Entrevista> completadas = entrevistas.stream()
                .filter(e -> "Completada".equals(e.getEstado()))
                .collect(Collectors.toList());

        boolean hasDynamic = completadas.stream()
                .anyMatch(e -> e.getCompetenciasEvaluadas() != null && !e.getCompetenciasEvaluadas().isEmpty());

        if (hasDynamic) {
            Map<String, List<Integer>> porCompetencia = new LinkedHashMap<>();
            for (Entrevista e : completadas) {
                if (e.getCompetenciasEvaluadas() != null) {
                    for (EntrevistaCompetencia ec : e.getCompetenciasEvaluadas()) {
                        porCompetencia.computeIfAbsent(ec.getNombreCompetencia(), k -> new ArrayList<>())
                                .add(ec.getNivelSeleccionado());
                    }
                }
            }
            return porCompetencia.entrySet().stream()
                    .map(entry -> {
                        List<Integer> valores = entry.getValue();
                        double avg = valores.stream().mapToInt(Integer::intValue).average().orElse(0);
                        double normalized = 1.0 + (avg / 3.0) * 4.0;
                        normalized = Math.round(normalized * 10.0) / 10.0;
                        return CompetenciaMetricDTO.builder()
                                .nombre(entry.getKey())
                                .totalEvaluaciones(valores.size())
                                .puntajePromedio(normalized)
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        // Fallback to 4 legacy competencies
        Map<String, List<Integer>> legacy = new LinkedHashMap<>();
        legacy.put("Habilidades Técnicas", new ArrayList<>());
        legacy.put("Comunicación", new ArrayList<>());
        legacy.put("Resolución de Problemas", new ArrayList<>());
        legacy.put("Trabajo en Equipo", new ArrayList<>());

        for (Entrevista e : completadas) {
            if (e.getCompetenciaComunicacion() != null) legacy.get("Comunicación").add(e.getCompetenciaComunicacion());
            if (e.getCompetenciaTecnica() != null) legacy.get("Habilidades Técnicas").add(e.getCompetenciaTecnica());
            if (e.getCompetenciaProactividad() != null) legacy.get("Trabajo en Equipo").add(e.getCompetenciaProactividad());
            if (e.getCompetenciaResolucion() != null) legacy.get("Resolución de Problemas").add(e.getCompetenciaResolucion());
        }

        return legacy.entrySet().stream()
                .filter(entry -> !entry.getValue().isEmpty())
                .map(entry -> {
                    List<Integer> valores = entry.getValue();
                    double avg = valores.stream().mapToInt(Integer::intValue).average().orElse(0);
                    avg = Math.round(avg * 10.0) / 10.0;
                    return CompetenciaMetricDTO.builder()
                            .nombre(entry.getKey())
                            .totalEvaluaciones(valores.size())
                            .puntajePromedio(avg)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<EntrevistaResponseDTO> obtenerHistorialEstudiante(String correoEstudiante) {
        List<Entrevista> historial = entrevistaRepository.findByEstudiante_Correo(correoEstudiante);
        return historial.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EntrevistaResponseDTO confirmarReprogramacion(Integer idEntrevista, String correoEstudiante) {
        Entrevista entrevista = entrevistaRepository.findById(idEntrevista)
                .orElseThrow(() -> new IllegalArgumentException("Entrevista no encontrada"));

        if (!entrevista.getEstudiante().getCorreo().equalsIgnoreCase(correoEstudiante.trim())) {
            throw new IllegalStateException("No tienes permisos para confirmar esta entrevista");
        }

        if (!"Reagendada".equals(entrevista.getEstado())) {
            throw new IllegalStateException("Solo se puede confirmar una reprogramación para una entrevista en estado 'Reagendada'");
        }

        entrevista.setEstado("Programada");
        entrevista.setFechaModificacion(LocalDateTime.now());
        entrevistaRepository.save(entrevista);

        // Notificar al mentor
        notificacionService.crearNotificacion(
                "CONFIRMACION_REPROGRAMACION",
                "El estudiante " + entrevista.getEstudiante().getNombreCompleto()
                        + " ha aceptado y confirmado la reprogramación de la entrevista para el " 
                        + entrevista.getFecha() + " a las " + entrevista.getHora(),
                entrevista.getMentor().getCorreo(),
                entrevista.getIdEntrevista()
        );

        // Notificar al estudiante como confirmación
        notificacionService.crearNotificacion(
                "ENTREVISTA_CONFIRMADA",
                "Has aceptado la fecha de reprogramación para tu entrevista del " 
                        + entrevista.getFecha() + " a las " + entrevista.getHora(),
                correoEstudiante,
                entrevista.getIdEntrevista()
        );

        // Enviar correos reales a ambos
        try {
            emailService.enviarCorreoCancelacionOReagendacion(
                    entrevista.getEstudiante().getCorreo(),
                    entrevista.getEstudiante().getNombreCompleto(),
                    entrevista.getMentor().getNombreCompleto(),
                    entrevista.getFecha().toString(),
                    entrevista.getHora(),
                    "Confirmada",
                    "La reprogramación ha sido aceptada por el estudiante."
            );
            emailService.enviarCorreoCancelacionOReagendacion(
                    entrevista.getMentor().getCorreo(),
                    entrevista.getEstudiante().getNombreCompleto(),
                    entrevista.getMentor().getNombreCompleto(),
                    entrevista.getFecha().toString(),
                    entrevista.getHora(),
                    "Confirmada",
                    "La reprogramación ha sido aceptada por el estudiante."
            );
        } catch (Exception e) {
            log.error("Error al enviar correos de confirmación de reprogramación: {}", e.getMessage());
        }

        log.info("Entrevista ID {} reprogramación confirmada por estudiante {}", idEntrevista, correoEstudiante);

        return mapToDTO(entrevista);
    }

    @Override
    public EntrevistaResponseDTO obtenerEntrevistaPorId(Integer idEntrevista) {
        Entrevista entrevista = entrevistaRepository.findById(idEntrevista)
                .orElseThrow(() -> new IllegalArgumentException("Entrevista no encontrada: " + idEntrevista));
        return mapToDTO(entrevista);
    }
}
