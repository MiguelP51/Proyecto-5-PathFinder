package com.pathfinder.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathfinder.dto.admin.pathchallenge.PathChallengeRequestDTO;
import com.pathfinder.dto.admin.pathchallenge.PathChallengeResponseDTO;
import com.pathfinder.dto.admin.pathchallenge.PathChallengeTaskDTO;
import com.pathfinder.model.entity.Habilidad;
import com.pathfinder.model.entity.PathChallenge;
import com.pathfinder.model.entity.PathChallengeTask;
import com.pathfinder.model.entity.SubArea;
import com.pathfinder.repository.HabilidadRepository;
import com.pathfinder.repository.PathChallengeRepository;
import com.pathfinder.repository.PathChallengeTaskRepository;
import com.pathfinder.repository.SubAreaRepository;
import com.pathfinder.service.PathChallengeService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PathChallengeServiceImpl implements PathChallengeService {

    private final PathChallengeRepository pathChallengeRepository;
    private final PathChallengeTaskRepository pathChallengeTaskRepository;
    private final SubAreaRepository subAreaRepository;
    private final HabilidadRepository habilidadRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<PathChallengeResponseDTO> getAllPathChallenges() {
        return pathChallengeRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PathChallengeResponseDTO getPathChallengeById(Integer id) {
        PathChallenge pathChallenge = pathChallengeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PathChallenge no encontrado"));
        return mapToResponseDTO(pathChallenge);
    }

    @Override
    @Transactional
    public PathChallengeResponseDTO createPathChallenge(PathChallengeRequestDTO request) {
        log.info(
                "Creando PathChallenge titulo='{}', estado='{}', subareaId={}, tareas={}",
                request.getTitulo(),
                request.getEstado(),
                request.getSubareaId(),
                request.getTareas() != null ? request.getTareas().size() : 0
        );

        PathChallenge pathChallenge = new PathChallenge();
        mapToEntity(request, pathChallenge);

        pathChallenge = pathChallengeRepository.save(pathChallenge);
        log.debug("PathChallenge creado con id={}. Guardando tareas...", pathChallenge.getIdPathChallenge());
        
        saveTasks(request.getTareas(), pathChallenge);

        // Update SubArea counter safely
        SubArea subArea = pathChallenge.getSubArea();
        subArea.setCantidadPathChallenges(safeCounter(subArea.getCantidadPathChallenges()) + 1);
        subAreaRepository.save(subArea);

        log.info("PathChallenge id={} creado correctamente", pathChallenge.getIdPathChallenge());

        return getPathChallengeById(pathChallenge.getIdPathChallenge());
    }

    @Override
    @Transactional
    public PathChallengeResponseDTO updatePathChallenge(Integer id, PathChallengeRequestDTO request) {
        log.info(
                "Actualizando PathChallenge id={}, titulo='{}', subareaId={}, tareas={}",
                id,
                request.getTitulo(),
                request.getSubareaId(),
                request.getTareas() != null ? request.getTareas().size() : 0
        );

        PathChallenge pathChallenge = pathChallengeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PathChallenge no encontrado"));

        Integer oldSubAreaId = pathChallenge.getSubArea().getIdSubarea();

        mapToEntity(request, pathChallenge);
        pathChallenge = pathChallengeRepository.save(pathChallenge);

        // Manage counter if subarea changed
        if (!oldSubAreaId.equals(request.getSubareaId())) {
            SubArea oldSubArea = subAreaRepository.findById(oldSubAreaId).orElse(null);
            if (oldSubArea != null && safeCounter(oldSubArea.getCantidadPathChallenges()) > 0) {
                oldSubArea.setCantidadPathChallenges(safeCounter(oldSubArea.getCantidadPathChallenges()) - 1);
                subAreaRepository.save(oldSubArea);
            }
            SubArea newSubArea = pathChallenge.getSubArea();
            newSubArea.setCantidadPathChallenges(safeCounter(newSubArea.getCantidadPathChallenges()) + 1);
            subAreaRepository.save(newSubArea);
        }

        pathChallengeTaskRepository.deleteByPathChallenge_IdPathChallenge(pathChallenge.getIdPathChallenge());
        saveTasks(request.getTareas(), pathChallenge);

        return getPathChallengeById(pathChallenge.getIdPathChallenge());
    }

    @Override
    @Transactional
    public PathChallengeTaskDTO createPathChallengeTask(Integer idPathChallenge, PathChallengeTaskDTO request) {
        log.info(
                "Creando tarea para PathChallenge id={}, titulo='{}', tipo='{}'",
                idPathChallenge,
                request.getTitulo(),
                request.getTipoTarea()
        );

        PathChallenge pathChallenge = pathChallengeRepository.findById(idPathChallenge)
                .orElseThrow(() -> new EntityNotFoundException("PathChallenge no encontrado"));

        List<PathChallengeTask> existingTasks = pathChallengeTaskRepository
                .findByPathChallenge_IdPathChallengeOrderByOrdenAsc(idPathChallenge);

        int nextOrder = existingTasks.stream()
                .map(PathChallengeTask::getOrden)
                .filter(order -> order != null)
                .max(Integer::compareTo)
                .orElse(0) + 1;

        PathChallengeTask task = mapTaskToEntity(
                request,
                pathChallenge,
                request.getOrden() != null ? request.getOrden() : nextOrder
        );

        return mapTaskToDTO(pathChallengeTaskRepository.save(task));
    }

    @Override
    @Transactional
    public PathChallengeTaskDTO updatePathChallengeTask(
            Integer idPathChallenge,
            Integer idPathChallengeTask,
            PathChallengeTaskDTO request
    ) {
        log.info(
                "Actualizando tarea id={} de PathChallenge id={}, titulo='{}', tipo='{}'",
                idPathChallengeTask,
                idPathChallenge,
                request.getTitulo(),
                request.getTipoTarea()
        );

        PathChallengeTask task = pathChallengeTaskRepository
                .findActiveTaskInChallenge(idPathChallengeTask, idPathChallenge)
                .orElseThrow(() -> new EntityNotFoundException("Tarea de PathChallenge no encontrada"));

        applyTaskDTO(request, task, task.getOrden(), true);

        return mapTaskToDTO(pathChallengeTaskRepository.save(task));
    }

    @Override
    @Transactional
    public void deletePathChallenge(Integer id) {
        PathChallenge pathChallenge = pathChallengeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PathChallenge no encontrado"));

        pathChallengeTaskRepository.deleteByPathChallenge_IdPathChallenge(id);
        
        SubArea subArea = pathChallenge.getSubArea();
        if (safeCounter(subArea.getCantidadPathChallenges()) > 0) {
            subArea.setCantidadPathChallenges(safeCounter(subArea.getCantidadPathChallenges()) - 1);
            subAreaRepository.save(subArea);
        }
        
        pathChallengeRepository.delete(pathChallenge);
    }

    private void mapToEntity(PathChallengeRequestDTO request, PathChallenge pathChallenge) {
        if (request.getSubareaId() == null) {
            throw new IllegalArgumentException("La subárea es obligatoria para crear o actualizar una misión");
        }

        pathChallenge.setTitulo(request.getTitulo());
        pathChallenge.setDificultad(request.getDificultad());
        pathChallenge.setXp(request.getXp() != null ? request.getXp() : 0);
        pathChallenge.setEstado(request.getEstado());

        SubArea subArea = subAreaRepository.findById(request.getSubareaId())
                .orElseThrow(() -> new EntityNotFoundException("SubArea no encontrada"));
        pathChallenge.setSubArea(subArea);

        if (request.getHabilidadesIds() != null && !request.getHabilidadesIds().isEmpty()) {
            List<Habilidad> habilidades = habilidadRepository.findAllById(request.getHabilidadesIds());
            pathChallenge.setHabilidades(habilidades);
        } else {
            pathChallenge.setHabilidades(new ArrayList<>());
        }
    }

    private void saveTasks(List<PathChallengeTaskDTO> tareasDTO, PathChallenge pathChallenge) {
        if (tareasDTO != null) {
            for (int i = 0; i < tareasDTO.size(); i++) {
                PathChallengeTaskDTO tareaDTO = tareasDTO.get(i);
                log.debug(
                        "Guardando tarea {} para PathChallenge id={}, titulo='{}', tipo='{}'",
                        i + 1,
                        pathChallenge.getIdPathChallenge(),
                        tareaDTO.getTitulo(),
                        tareaDTO.getTipoTarea()
                );
                pathChallengeTaskRepository.save(mapTaskToEntity(
                        tareaDTO,
                        pathChallenge,
                        tareaDTO.getOrden() != null ? tareaDTO.getOrden() : i + 1
                ));
            }
        }
    }

    private PathChallengeTask mapTaskToEntity(
            PathChallengeTaskDTO tareaDTO,
            PathChallenge pathChallenge,
            Integer defaultOrder
    ) {
        PathChallengeTask task = new PathChallengeTask();
        task.setPathChallenge(pathChallenge);
        applyTaskDTO(tareaDTO, task, defaultOrder, false);
        return task;
    }

    private void applyTaskDTO(
            PathChallengeTaskDTO tareaDTO,
            PathChallengeTask task,
            Integer defaultOrder,
            boolean preserveOmittedFields
    ) {
        String descripcion = resolveDescription(tareaDTO);
        if (descripcion != null || !preserveOmittedFields) {
            task.setDescripcion(descripcion != null ? descripcion : "Tarea");
        }

        if (tareaDTO.getOrden() != null || task.getOrden() == null || !preserveOmittedFields) {
            task.setOrden(tareaDTO.getOrden() != null ? tareaDTO.getOrden() : defaultOrder);
        }

        if (tareaDTO.getTitulo() != null || !preserveOmittedFields) {
            task.setTitulo(tareaDTO.getTitulo());
        }

        if (tareaDTO.getTipoTarea() != null || !preserveOmittedFields) {
            task.setTipoTarea(
                    hasText(tareaDTO.getTipoTarea())
                            ? tareaDTO.getTipoTarea().trim()
                            : "INFORMATION"
            );
        }

        if (tareaDTO.getContenido() != null || !preserveOmittedFields) {
            task.setContenido(tareaDTO.getContenido());
        }

        if (
                tareaDTO.getOpcionesJson() != null
                        || tareaDTO.getOpciones() != null
                        || !preserveOmittedFields
        ) {
            task.setOpcionesJson(resolveOptionsJson(tareaDTO));
        }

        if (tareaDTO.getObligatoria() != null || !preserveOmittedFields) {
            task.setObligatoria(
                    tareaDTO.getObligatoria() == null
                            ? true
                            : tareaDTO.getObligatoria()
            );
        }

        if (tareaDTO.getConfigJson() != null || !preserveOmittedFields) {
            task.setConfigJson(tareaDTO.getConfigJson());
        }
    }

    private String resolveDescription(PathChallengeTaskDTO tareaDTO) {
        if (hasText(tareaDTO.getDescripcion())) {
            return tareaDTO.getDescripcion().trim();
        }

        if (hasText(tareaDTO.getContenido())) {
            return tareaDTO.getContenido().trim();
        }

        if (hasText(tareaDTO.getTitulo())) {
            return tareaDTO.getTitulo().trim();
        }

        return null;
    }

    private String resolveOptionsJson(PathChallengeTaskDTO tareaDTO) {
        if (hasText(tareaDTO.getOpcionesJson())) {
            return tareaDTO.getOpcionesJson();
        }

        if (tareaDTO.getOpciones() == null) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(tareaDTO.getOpciones());
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Las opciones de la tarea no tienen un formato válido", e);
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private int safeCounter(Integer value) {
        return value != null ? value : 0;
    }

    private PathChallengeResponseDTO mapToResponseDTO(PathChallenge pathChallenge) {
        List<PathChallengeTask> tareas = pathChallengeTaskRepository
                .findByPathChallenge_IdPathChallengeOrderByOrdenAsc(pathChallenge.getIdPathChallenge());

        List<PathChallengeTaskDTO> tareasDTO = tareas.stream()
                .map(this::mapTaskToDTO)
                .collect(Collectors.toList());

        List<String> tags = pathChallenge.getHabilidades() != null 
                ? pathChallenge.getHabilidades().stream().map(Habilidad::getNombreHabilidad).collect(Collectors.toList())
                : new ArrayList<>();

        return PathChallengeResponseDTO.builder()
                .idPathChallenge(pathChallenge.getIdPathChallenge())
                .titulo(pathChallenge.getTitulo())
                .dificultad(pathChallenge.getDificultad())
                .xp(pathChallenge.getXp())
                .estado(pathChallenge.getEstado())
                .completadas(pathChallenge.getCompletadas())
                .subareaId(pathChallenge.getSubArea().getIdSubarea())
                .subareaNombre(pathChallenge.getSubArea().getNombre())
                .tags(tags)
                .tareasCount(tareas.size())
                .tareas(tareasDTO)
                .build();
    }

    private PathChallengeTaskDTO mapTaskToDTO(PathChallengeTask task) {
        PathChallengeTaskDTO dto = new PathChallengeTaskDTO();
        dto.setIdPathChallengeTask(task.getIdPathChallengeTask());
        dto.setDescripcion(task.getDescripcion());
        dto.setOrden(task.getOrden());
        dto.setTitulo(task.getTitulo());
        dto.setTipoTarea(task.getTipoTarea());
        dto.setContenido(task.getContenido());
        dto.setOpcionesJson(task.getOpcionesJson());
        dto.setObligatoria(task.getObligatoria());
        dto.setConfigJson(task.getConfigJson());
        return dto;
    }
}
