package com.pathfinder.service.impl;

import com.pathfinder.dto.response.DisponibilidadDTO;
import com.pathfinder.dto.response.MentorDisponibilidadDTO;
import com.pathfinder.dto.response.MentorDisponibilidadCompletaDTO;
import com.pathfinder.model.entity.DisponibilidadMentor;
import com.pathfinder.model.entity.ConfiguracionDisponibilidadMentor;
import com.pathfinder.model.entity.Entrevista;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.enums.RolUsuario;
import com.pathfinder.repository.DisponibilidadMentorRepository;
import com.pathfinder.repository.ConfiguracionDisponibilidadMentorRepository;
import com.pathfinder.repository.EntrevistaRepository;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.service.DisponibilidadService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DisponibilidadServiceImpl implements DisponibilidadService {

    private final DisponibilidadMentorRepository disponibilidadRepository;
    private final ConfiguracionDisponibilidadMentorRepository configuracionRepository;
    private final EntrevistaRepository entrevistaRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    public List<DisponibilidadDTO> obtenerDisponibilidadMentor(String correoMentor) {
        return disponibilidadRepository.findByMentor_CorreoAndActivoTrue(correoMentor)
                .stream()
                .map(d -> DisponibilidadDTO.builder()
                        .idDisponibilidad(d.getIdDisponibilidad())
                        .diaSemana(d.getDiaSemana())
                        .horaInicio(d.getHoraInicio())
                        .horaFin(d.getHoraFin())
                        .tipoEntrevista(d.getTipoEntrevista())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void guardarDisponibilidadMentor(String correoMentor, List<DisponibilidadDTO> disponibilidadList) {
        Usuario mentor = usuarioRepository.findByCorreo(correoMentor)
                .orElseThrow(() -> new IllegalArgumentException("Mentor no encontrado"));

        // Eliminar disponibilidad anterior activa
        List<DisponibilidadMentor> anteriores = disponibilidadRepository.findByMentor_IdUsuarioAndActivoTrue(mentor.getIdUsuario());
        anteriores.forEach(a -> {
            a.setActivo(false);
            a.setFechaModificacion(java.time.LocalDateTime.now());
        });
        disponibilidadRepository.saveAll(anteriores);

        // Guardar la nueva disponibilidad
        List<DisponibilidadMentor> nuevas = disponibilidadList.stream().map(dto -> {
            DisponibilidadMentor d = new DisponibilidadMentor();
            d.setMentor(mentor);
            d.setDiaSemana(dto.getDiaSemana());
            d.setHoraInicio(dto.getHoraInicio());
            d.setHoraFin(dto.getHoraFin());
            d.setTipoEntrevista(dto.getTipoEntrevista());
            d.setActivo(true);
            return d;
        }).collect(Collectors.toList());

        disponibilidadRepository.saveAll(nuevas);
        log.info("Disponibilidad guardada para el mentor {}", correoMentor);
    }

    @Override
    @Transactional
    public void eliminarDisponibilidad(Integer idDisponibilidad, String correoMentor) {
        DisponibilidadMentor d = disponibilidadRepository.findById(idDisponibilidad)
                .orElseThrow(() -> new IllegalArgumentException("Bloque de disponibilidad no encontrado"));
        
        if (!d.getMentor().getCorreo().equals(correoMentor)) {
            throw new IllegalStateException("No tienes permisos para eliminar este bloque");
        }

        d.setActivo(false);
        d.setFechaModificacion(java.time.LocalDateTime.now());
        disponibilidadRepository.save(d);
    }

    @Override
    public List<MentorDisponibilidadDTO> obtenerMentoresDisponibles() {
        List<DisponibilidadMentor> disp = disponibilidadRepository.findByActivoTrue();
        Set<Usuario> mentores = disp.stream().map(DisponibilidadMentor::getMentor).collect(Collectors.toSet());

        return mentores.stream()
                .map(m -> MentorDisponibilidadDTO.builder()
                        .idUsuario(m.getIdUsuario())
                        .nombreCompleto(m.getNombreCompleto())
                        .correo(m.getCorreo())
                        .avatarUrl(m.getAvatarUrl())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<String> obtenerSlotsDisponibles(Integer idMentor, String fechaStr) {
        LocalDate fecha = LocalDate.parse(fechaStr);
        DayOfWeek dayOfWeek = fecha.getDayOfWeek();
        String diaSemana = translateDayOfWeek(dayOfWeek);

        // Recuperar la configuración del mentor (o aplicar defaults)
        ConfiguracionDisponibilidadMentor config = configuracionRepository.findByMentor_IdUsuarioAndActivoTrue(idMentor)
                .orElseGet(() -> {
                    ConfiguracionDisponibilidadMentor defaultConf = new ConfiguracionDisponibilidadMentor();
                    defaultConf.setDuracionEntrevista(60);
                    defaultConf.setTiempoEntreEntrevistas(15);
                    defaultConf.setMaxEntrevistasDia(4);
                    defaultConf.setDiasDisponibles("Lunes,Miércoles,Viernes");
                    return defaultConf;
                });

        // Validar si el día de la semana está habilitado en su configuración
        List<String> diasValidos = Arrays.asList(config.getDiasDisponibles().split(","));
        boolean diaHabilitado = diasValidos.stream().anyMatch(d -> d.trim().equalsIgnoreCase(diaSemana));
        if (!diaHabilitado) {
            return Collections.emptyList();
        }

        // Obtener las entrevistas agendadas con este mentor en la fecha elegida
        List<Entrevista> citasReservadas = entrevistaRepository.findByMentor_IdUsuarioAndFechaAndActivoTrue(idMentor, fecha);
        
        // Si ya alcanzó el máximo de entrevistas permitidas por día, no ofrecemos slots
        if (citasReservadas.size() >= config.getMaxEntrevistasDia()) {
            log.info("Mentor ID {} alcanzó el límite diario de entrevistas ({}) para la fecha {}", idMentor, config.getMaxEntrevistasDia(), fechaStr);
            return Collections.emptyList();
        }

        Set<String> horasReservadas = citasReservadas.stream()
                .map(Entrevista::getHora)
                .collect(Collectors.toSet());

        // Obtener los bloques de disponibilidad del mentor para ese día
        List<DisponibilidadMentor> bloques = disponibilidadRepository.findByMentor_IdUsuarioAndActivoTrue(idMentor)
                .stream()
                .filter(b -> b.getDiaSemana().equalsIgnoreCase(diaSemana))
                .collect(Collectors.toList());

        List<String> slots = new ArrayList<>();
        int duracion = config.getDuracionEntrevista();
        int descanso = config.getTiempoEntreEntrevistas();

        for (DisponibilidadMentor bloque : bloques) {
            try {
                LocalTime start = LocalTime.parse(bloque.getHoraInicio());
                LocalTime end = LocalTime.parse(bloque.getHoraFin());

                while (start.plusMinutes(duracion).isBefore(end) || start.plusMinutes(duracion).equals(end)) {
                    String timeStr = start.toString().substring(0, 5); // "HH:MM"
                    if (!horasReservadas.contains(timeStr)) {
                        slots.add(timeStr);
                    }
                    start = start.plusMinutes(duracion + descanso);
                }
            } catch (Exception e) {
                log.error("Error parseando horas del bloque {}: {}", bloque.getIdDisponibilidad(), e.getMessage());
            }
        }
        
        Collections.sort(slots);
        return slots;
    }

    @Override
    public MentorDisponibilidadCompletaDTO obtenerDisponibilidadCompleta(String correoMentor) {
        // Cargar Configuración
        ConfiguracionDisponibilidadMentor config = configuracionRepository.findByMentor_CorreoAndActivoTrue(correoMentor)
                .orElseGet(() -> {
                    ConfiguracionDisponibilidadMentor defaultConf = new ConfiguracionDisponibilidadMentor();
                    defaultConf.setDuracionEntrevista(60);
                    defaultConf.setTiempoEntreEntrevistas(15);
                    defaultConf.setMaxEntrevistasDia(4);
                    defaultConf.setDiasDisponibles("Lunes,Miércoles,Viernes");
                    return defaultConf;
                });

        List<String> listDias = Arrays.stream(config.getDiasDisponibles().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        // Cargar bloques de tiempo
        List<DisponibilidadDTO> bloques = obtenerDisponibilidadMentor(correoMentor);

        return MentorDisponibilidadCompletaDTO.builder()
                .duracionEntrevista(config.getDuracionEntrevista())
                .tiempoEntreEntrevistas(config.getTiempoEntreEntrevistas())
                .maxEntrevistasDia(config.getMaxEntrevistasDia())
                .diasDisponibles(listDias)
                .bloques(bloques)
                .build();
    }

    @Override
    @Transactional
    public void guardarDisponibilidadCompleta(String correoMentor, MentorDisponibilidadCompletaDTO dto) {
        Usuario mentor = usuarioRepository.findByCorreo(correoMentor)
                .orElseThrow(() -> new IllegalArgumentException("Mentor no encontrado"));

        // 1. Guardar o actualizar la configuración
        ConfiguracionDisponibilidadMentor config = configuracionRepository.findByMentor_IdUsuarioAndActivoTrue(mentor.getIdUsuario())
                .orElseGet(() -> {
                    ConfiguracionDisponibilidadMentor c = new ConfiguracionDisponibilidadMentor();
                    c.setMentor(mentor);
                    return c;
                });

        config.setDuracionEntrevista(dto.getDuracionEntrevista());
        config.setTiempoEntreEntrevistas(dto.getTiempoEntreEntrevistas());
        config.setMaxEntrevistasDia(dto.getMaxEntrevistasDia());
        
        String diasStr = dto.getDiasDisponibles() != null 
                ? String.join(",", dto.getDiasDisponibles()) 
                : "Lunes,Miércoles,Viernes";
        config.setDiasDisponibles(diasStr);
        config.setActivo(true);
        config.setFechaModificacion(java.time.LocalDateTime.now());
        
        configuracionRepository.save(config);

        // 2. Limpiar bloques de tiempo anteriores
        List<DisponibilidadMentor> anteriores = disponibilidadRepository.findByMentor_IdUsuarioAndActivoTrue(mentor.getIdUsuario());
        anteriores.forEach(a -> {
            a.setActivo(false);
            a.setFechaModificacion(java.time.LocalDateTime.now());
        });
        disponibilidadRepository.saveAll(anteriores);

        // 3. Guardar los nuevos bloques de tiempo
        // Filtrar bloques correspondientes a días desmarcados para mantener coherencia
        Set<String> diasActivos = dto.getDiasDisponibles() != null 
                ? dto.getDiasDisponibles().stream().map(String::toLowerCase).collect(Collectors.toSet())
                : new HashSet<>(Arrays.asList("lunes", "miércoles", "viernes"));

        List<DisponibilidadMentor> nuevas = dto.getBloques().stream()
                .filter(b -> diasActivos.contains(b.getDiaSemana().toLowerCase()))
                .map(blockDto -> {
                    DisponibilidadMentor d = new DisponibilidadMentor();
                    d.setMentor(mentor);
                    d.setDiaSemana(blockDto.getDiaSemana());
                    d.setHoraInicio(blockDto.getHoraInicio());
                    d.setHoraFin(blockDto.getHoraFin());
                    d.setTipoEntrevista(blockDto.getTipoEntrevista());
                    d.setActivo(true);
                    return d;
                }).collect(Collectors.toList());

        disponibilidadRepository.saveAll(nuevas);
        log.info("Disponibilidad completa guardada con éxito para el mentor {}", correoMentor);
    }

    private String translateDayOfWeek(DayOfWeek day) {
        switch (day) {
            case MONDAY: return "Lunes";
            case TUESDAY: return "Martes";
            case WEDNESDAY: return "Miércoles";
            case THURSDAY: return "Jueves";
            case FRIDAY: return "Viernes";
            case SATURDAY: return "Sábado";
            case SUNDAY: return "Domingo";
            default: return "";
        }
    }
}
