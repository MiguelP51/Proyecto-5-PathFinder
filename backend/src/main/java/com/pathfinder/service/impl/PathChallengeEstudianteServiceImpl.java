package com.pathfinder.service.impl;

import com.pathfinder.dto.student.pathchallenge.PathChallengeAvanceRequestDTO;
import com.pathfinder.dto.student.pathchallenge.PathChallengeEstudianteResponseDTO;
import com.pathfinder.dto.student.pathchallenge.PathChallengeFinalizarRequestDTO;
import com.pathfinder.model.entity.Habilidad;
import com.pathfinder.model.entity.PathChallenge;
import com.pathfinder.model.entity.PathChallengeTask;
import com.pathfinder.model.entity.SubArea;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.entity.UsuarioPathChallenge;
import com.pathfinder.model.entity.UsuarioPathChallengeTask;
import com.pathfinder.repository.PathChallengeRepository;
import com.pathfinder.repository.PathChallengeTaskRepository;
import com.pathfinder.repository.UsuarioPathChallengeRepository;
import com.pathfinder.repository.UsuarioPathChallengeTaskRepository;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.service.PathChallengeEstudianteService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.util.stream.Collectors.toMap;

@Service
@RequiredArgsConstructor
public class PathChallengeEstudianteServiceImpl implements PathChallengeEstudianteService {

    private static final String ESTADO_DISPONIBLE = "DISPONIBLE";
    private static final String ESTADO_EN_PROGRESO = "EN_PROGRESO";
    private static final String ESTADO_COMPLETADO = "COMPLETADO";

    private final UsuarioRepository usuarioRepository;
    private final PathChallengeRepository pathChallengeRepository;
    private final PathChallengeTaskRepository pathChallengeTaskRepository;
    private final UsuarioPathChallengeRepository usuarioPathChallengeRepository;
    private final UsuarioPathChallengeTaskRepository usuarioPathChallengeTaskRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PathChallengeEstudianteResponseDTO> listarPorSubarea(
            String correo,
            Integer idSubarea
    ) {
        List<PathChallenge> challenges =
                pathChallengeRepository.findPublicadosBySubAreaWithHabilidades(idSubarea);

        if (challenges.isEmpty()) {
            return List.of();
        }

        List<Integer> ids = challenges.stream()
                .map(PathChallenge::getIdPathChallenge)
                .toList();

        Map<Integer, UsuarioPathChallenge> avancesPorChallenge =
                usuarioPathChallengeRepository
                        .findByUsuario_CorreoAndPathChallenge_IdPathChallengeIn(correo, ids)
                        .stream()
                        .collect(toMap(
                                avance -> avance.getPathChallenge().getIdPathChallenge(),
                                avance -> avance
                        ));

        return challenges.stream()
                .map(challenge -> mapToResponse(
                        challenge,
                        avancesPorChallenge.get(challenge.getIdPathChallenge()),
                        false
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PathChallengeEstudianteResponseDTO obtenerDetalle(
            String correo,
            Integer idPathChallenge
    ) {
        PathChallenge challenge = obtenerChallengePublicado(idPathChallenge);

        UsuarioPathChallenge avance = usuarioPathChallengeRepository
                .findByUsuario_CorreoAndPathChallenge_IdPathChallenge(correo, idPathChallenge)
                .orElse(null);

        return mapToResponse(challenge, avance, true);
    }

    @Override
    @Transactional
    public PathChallengeEstudianteResponseDTO iniciar(
            String correo,
            Integer idPathChallenge
    ) {
        Usuario usuario = obtenerUsuario(correo);
        PathChallenge challenge = obtenerChallengePublicado(idPathChallenge);

        UsuarioPathChallenge avance = usuarioPathChallengeRepository
                .findByUsuario_IdUsuarioAndPathChallenge_IdPathChallenge(
                        usuario.getIdUsuario(),
                        idPathChallenge
                )
                .orElseGet(() -> {
                    UsuarioPathChallenge nuevo = new UsuarioPathChallenge();
                    nuevo.setUsuario(usuario);
                    nuevo.setPathChallenge(challenge);
                    nuevo.setEstado(ESTADO_EN_PROGRESO);
                    nuevo.setProgresoPorcentaje(0);
                    nuevo.setFechaInicio(LocalDateTime.now());
                    nuevo.setFechaUltimoAvance(LocalDateTime.now());
                    return usuarioPathChallengeRepository.save(nuevo);
                });

        if (!ESTADO_COMPLETADO.equalsIgnoreCase(avance.getEstado())) {
            avance.setEstado(ESTADO_EN_PROGRESO);
            avance.setFechaUltimoAvance(LocalDateTime.now());
            avance = usuarioPathChallengeRepository.save(avance);
        }

        return mapToResponse(challenge, avance, true);
    }

    @Override
    @Transactional
    public PathChallengeEstudianteResponseDTO guardarAvance(
            String correo,
            Integer idPathChallenge,
            PathChallengeAvanceRequestDTO request
    ) {
        Usuario usuario = obtenerUsuario(correo);
        PathChallenge challenge = obtenerChallengePublicado(idPathChallenge);

        UsuarioPathChallenge avance = obtenerOCrearAvance(usuario, challenge);

        List<PathChallengeTask> tareas = obtenerTareasChallenge(idPathChallenge);
        Set<Integer> completedTaskIds = normalizarIds(request.getCompletedTaskIds());

        validarTareasPertenecenAlChallenge(completedTaskIds, tareas);

        sincronizarTareas(avance, tareas, completedTaskIds);

        int progreso = calcularProgreso(tareas, completedTaskIds);

        if (!ESTADO_COMPLETADO.equalsIgnoreCase(avance.getEstado())) {
            avance.setEstado(ESTADO_EN_PROGRESO);
        }

        avance.setProgresoPorcentaje(progreso);
        avance.setFechaUltimoAvance(LocalDateTime.now());

        if (request.getEntregaTexto() != null) {
            avance.setEntregaTexto(request.getEntregaTexto().trim());
        }

        avance = usuarioPathChallengeRepository.save(avance);

        return mapToResponse(challenge, avance, true);
    }

    @Override
    @Transactional
    public PathChallengeEstudianteResponseDTO finalizar(
            String correo,
            Integer idPathChallenge,
            PathChallengeFinalizarRequestDTO request
    ) {
        Usuario usuario = obtenerUsuario(correo);
        PathChallenge challenge = obtenerChallengePublicado(idPathChallenge);

        UsuarioPathChallenge avance = obtenerOCrearAvance(usuario, challenge);

        List<PathChallengeTask> tareas = obtenerTareasChallenge(idPathChallenge);

        if (tareas.isEmpty()) {
            throw new IllegalArgumentException("La misión no tiene tareas configuradas");
        }

        Set<Integer> completedTaskIds = normalizarIds(request.getCompletedTaskIds());

        if (completedTaskIds.isEmpty()) {
            completedTaskIds = obtenerIdsTareasCompletadas(avance.getIdUsuarioPathChallenge());
        }

        validarTareasPertenecenAlChallenge(completedTaskIds, tareas);
        sincronizarTareas(avance, tareas, completedTaskIds);

        boolean todasCompletadas = completedTaskIds.size() == tareas.size();

        if (!todasCompletadas) {
            throw new IllegalArgumentException("Debes completar todas las tareas antes de enviar la misión");
        }

        String entregaTexto = request.getEntregaTexto();

        if (entregaTexto != null) {
            entregaTexto = entregaTexto.trim();
            avance.setEntregaTexto(entregaTexto);
        } else {
            entregaTexto = avance.getEntregaTexto();
        }

        boolean tieneEntregaTexto = entregaTexto != null && !entregaTexto.isBlank();
        boolean tieneArchivo = avance.getArchivoUrl() != null && !avance.getArchivoUrl().isBlank();

        if (!tieneEntregaTexto && !tieneArchivo) {
            throw new IllegalArgumentException("Debes registrar una entrega antes de finalizar la misión");
        }

        boolean yaEstabaCompletado = ESTADO_COMPLETADO.equalsIgnoreCase(avance.getEstado());

        avance.setEstado(ESTADO_COMPLETADO);
        avance.setProgresoPorcentaje(100);
        avance.setFechaUltimoAvance(LocalDateTime.now());

        if (avance.getFechaFinalizacion() == null) {
            avance.setFechaFinalizacion(LocalDateTime.now());
        }

        avance = usuarioPathChallengeRepository.save(avance);

        if (!yaEstabaCompletado) {
            Integer completadasActuales = challenge.getCompletadas() != null
                    ? challenge.getCompletadas()
                    : 0;

            challenge.setCompletadas(completadasActuales + 1);
            pathChallengeRepository.save(challenge);
        }

        return mapToResponse(challenge, avance, true);
    }

    private Usuario obtenerUsuario(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
    }

    private PathChallenge obtenerChallengePublicado(Integer idPathChallenge) {
        return pathChallengeRepository.findPublicadoByIdWithHabilidades(idPathChallenge)
                .orElseThrow(() -> new EntityNotFoundException("PathChallenge no encontrado o no publicado"));
    }

    private UsuarioPathChallenge obtenerOCrearAvance(
            Usuario usuario,
            PathChallenge challenge
    ) {
        return usuarioPathChallengeRepository
                .findByUsuario_IdUsuarioAndPathChallenge_IdPathChallenge(
                        usuario.getIdUsuario(),
                        challenge.getIdPathChallenge()
                )
                .orElseGet(() -> {
                    UsuarioPathChallenge nuevo = new UsuarioPathChallenge();
                    nuevo.setUsuario(usuario);
                    nuevo.setPathChallenge(challenge);
                    nuevo.setEstado(ESTADO_EN_PROGRESO);
                    nuevo.setProgresoPorcentaje(0);
                    nuevo.setFechaInicio(LocalDateTime.now());
                    nuevo.setFechaUltimoAvance(LocalDateTime.now());
                    return usuarioPathChallengeRepository.save(nuevo);
                });
    }

    private List<PathChallengeTask> obtenerTareasChallenge(Integer idPathChallenge) {
        return pathChallengeTaskRepository
                .findByPathChallenge_IdPathChallengeOrderByOrdenAsc(idPathChallenge);
    }

    private Set<Integer> normalizarIds(Collection<Integer> ids) {
        if (ids == null) {
            return new HashSet<>();
        }

        return new HashSet<>(ids);
    }

    private void validarTareasPertenecenAlChallenge(
            Set<Integer> completedTaskIds,
            List<PathChallengeTask> tareas
    ) {
        Set<Integer> idsValidos = tareas.stream()
                .map(PathChallengeTask::getIdPathChallengeTask)
                .collect(java.util.stream.Collectors.toSet());

        for (Integer idTask : completedTaskIds) {
            if (!idsValidos.contains(idTask)) {
                throw new IllegalArgumentException("Una de las tareas no pertenece a esta misión");
            }
        }
    }

    private void sincronizarTareas(
            UsuarioPathChallenge avance,
            List<PathChallengeTask> tareas,
            Set<Integer> completedTaskIds
    ) {
        List<UsuarioPathChallengeTask> registros =
                usuarioPathChallengeTaskRepository
                        .findByUsuarioPathChallenge_IdUsuarioPathChallenge(
                                avance.getIdUsuarioPathChallenge()
                        );

        Map<Integer, UsuarioPathChallengeTask> registrosPorTask =
                registros.stream()
                        .collect(toMap(
                                registro -> registro.getPathChallengeTask().getIdPathChallengeTask(),
                                registro -> registro
                        ));

        for (PathChallengeTask tarea : tareas) {
            UsuarioPathChallengeTask registro = registrosPorTask
                    .get(tarea.getIdPathChallengeTask());

            if (registro == null) {
                registro = new UsuarioPathChallengeTask();
                registro.setUsuarioPathChallenge(avance);
                registro.setPathChallengeTask(tarea);
            }

            boolean completada = completedTaskIds.contains(tarea.getIdPathChallengeTask());

            registro.setCompletada(completada);

            if (completada && registro.getFechaCompletada() == null) {
                registro.setFechaCompletada(LocalDateTime.now());
            }

            if (!completada) {
                registro.setFechaCompletada(null);
            }

            usuarioPathChallengeTaskRepository.save(registro);
        }
    }

    private int calcularProgreso(
            List<PathChallengeTask> tareas,
            Set<Integer> completedTaskIds
    ) {
        if (tareas.isEmpty()) {
            return 0;
        }

        return (int) Math.round((completedTaskIds.size() * 100.0) / tareas.size());
    }

    private Set<Integer> obtenerIdsTareasCompletadas(Integer idUsuarioPathChallenge) {
        return usuarioPathChallengeTaskRepository
                .findByUsuarioPathChallenge_IdUsuarioPathChallenge(idUsuarioPathChallenge)
                .stream()
                .filter(registro -> Boolean.TRUE.equals(registro.getCompletada()))
                .map(registro -> registro.getPathChallengeTask().getIdPathChallengeTask())
                .collect(java.util.stream.Collectors.toSet());
    }

    private PathChallengeEstudianteResponseDTO mapToResponse(
            PathChallenge challenge,
            UsuarioPathChallenge avance,
            boolean incluirTareas
    ) {
        SubArea subArea = challenge.getSubArea();

        List<PathChallengeTask> tareas = obtenerTareasChallenge(challenge.getIdPathChallenge());

        Map<Integer, UsuarioPathChallengeTask> tareasCompletadas = obtenerTareasCompletadasMap(avance);

        int totalTareas = tareas.size();

        int completadas = avance == null
                ? 0
                : (int) tareasCompletadas.values()
                .stream()
                .filter(t -> Boolean.TRUE.equals(t.getCompletada()))
                .count();

        int progreso = avance != null && avance.getProgresoPorcentaje() != null
                ? avance.getProgresoPorcentaje()
                : 0;

        String status = avance != null && avance.getEstado() != null
                ? avance.getEstado()
                : ESTADO_DISPONIBLE;

        List<PathChallengeEstudianteResponseDTO.PathChallengeTaskEstudianteDTO> tareasDTO =
                incluirTareas
                        ? tareas.stream()
                        .map(tarea -> {
                            UsuarioPathChallengeTask avanceTarea =
                                    tareasCompletadas.get(tarea.getIdPathChallengeTask());

                            return PathChallengeEstudianteResponseDTO.PathChallengeTaskEstudianteDTO
                                    .builder()
                                    .idPathChallengeTask(tarea.getIdPathChallengeTask())
                                    .description(tarea.getDescripcion())
                                    .order(tarea.getOrden())
                                    .completed(
                                            avanceTarea != null
                                                    && Boolean.TRUE.equals(avanceTarea.getCompletada())
                                    )
                                    .build();
                        })
                        .toList()
                        : new ArrayList<>();

        return PathChallengeEstudianteResponseDTO.builder()
                .id(String.valueOf(challenge.getIdPathChallenge()))
                .idPathChallenge(challenge.getIdPathChallenge())
                .areaId(subArea != null ? subArea.getAreaId() : null)
                .areaName(subArea != null ? subArea.getAreaNombre() : null)
                .subareaId(subArea != null ? String.valueOf(subArea.getIdSubarea()) : null)
                .subareaName(subArea != null ? subArea.getNombre() : null)
                .title(challenge.getTitulo())
                .description(buildDescription(challenge, subArea))
                .difficulty(challenge.getDificultad())
                .durationLabel(buildDurationLabel(challenge.getDificultad()))
                .xp(challenge.getXp())
                .progressPercentage(progreso)
                .status(status)
                .completedTasksCount(completadas)
                .totalTasksCount(totalTareas)
                .skills(mapSkills(challenge.getHabilidades()))
                .tasks(tareasDTO)
                .submission(buildSubmission(avance))
                .reward(buildReward(challenge, avance))
                .build();
    }

    private Map<Integer, UsuarioPathChallengeTask> obtenerTareasCompletadasMap(
            UsuarioPathChallenge avance
    ) {
        if (avance == null || avance.getIdUsuarioPathChallenge() == null) {
            return Map.of();
        }

        return usuarioPathChallengeTaskRepository
                .findByUsuarioPathChallenge_IdUsuarioPathChallenge(
                        avance.getIdUsuarioPathChallenge()
                )
                .stream()
                .collect(toMap(
                        registro -> registro.getPathChallengeTask().getIdPathChallengeTask(),
                        registro -> registro
                ));
    }

    private List<PathChallengeEstudianteResponseDTO.PathChallengeSkillDTO> mapSkills(
            List<Habilidad> habilidades
    ) {
        if (habilidades == null) {
            return List.of();
        }

        return habilidades.stream()
                .map(habilidad -> PathChallengeEstudianteResponseDTO.PathChallengeSkillDTO
                        .builder()
                        .id(String.valueOf(habilidad.getIdHabilidad()))
                        .name(habilidad.getNombreHabilidad())
                        .build())
                .toList();
    }

    private PathChallengeEstudianteResponseDTO.PathChallengeSubmissionDTO buildSubmission(
            UsuarioPathChallenge avance
    ) {
        if (avance == null) {
            return null;
        }

        return PathChallengeEstudianteResponseDTO.PathChallengeSubmissionDTO
                .builder()
                .text(avance.getEntregaTexto())
                .fileName(avance.getArchivoNombre())
                .fileUrl(avance.getArchivoUrl())
                .updatedAt(toIso(avance.getFechaUltimoAvance()))
                .completedAt(toIso(avance.getFechaFinalizacion()))
                .build();
    }

    private PathChallengeEstudianteResponseDTO.PathChallengeRewardDTO buildReward(
            PathChallenge challenge,
            UsuarioPathChallenge avance
    ) {
        if (avance == null || !ESTADO_COMPLETADO.equalsIgnoreCase(avance.getEstado())) {
            return null;
        }

        return PathChallengeEstudianteResponseDTO.PathChallengeRewardDTO
                .builder()
                .xpAwarded(challenge.getXp())
                .badgeName("Misión completada")
                .badgeDescription("Completaste un PathChallenge práctico")
                .awardedAt(toIso(avance.getFechaFinalizacion()))
                .build();
    }

    private String buildDescription(
            PathChallenge challenge,
            SubArea subArea
    ) {
        if (subArea != null && subArea.getNombre() != null) {
            return "Completa esta misión práctica para aplicar tus habilidades en "
                    + subArea.getNombre()
                    + ".";
        }

        return "Completa esta misión práctica para aplicar tus habilidades.";
    }

    private String buildDurationLabel(String dificultad) {
        if (dificultad == null) {
            return "30-45 min";
        }

        String normalized = dificultad.trim().toLowerCase();

        if (normalized.contains("fácil") || normalized.contains("facil") || normalized.contains("básico") || normalized.contains("basico")) {
            return "30 min";
        }

        if (normalized.contains("difícil") || normalized.contains("dificil") || normalized.contains("avanzado")) {
            return "90 min";
        }

        return "60 min";
    }

    private String toIso(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.toString() : null;
    }
}