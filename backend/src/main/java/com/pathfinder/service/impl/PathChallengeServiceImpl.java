package com.pathfinder.service.impl;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PathChallengeServiceImpl implements PathChallengeService {

    private final PathChallengeRepository pathChallengeRepository;
    private final PathChallengeTaskRepository pathChallengeTaskRepository;
    private final SubAreaRepository subAreaRepository;
    private final HabilidadRepository habilidadRepository;

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
        PathChallenge pathChallenge = new PathChallenge();
        mapToEntity(request, pathChallenge);

        pathChallenge = pathChallengeRepository.save(pathChallenge);
        
        saveTasks(request.getTareas(), pathChallenge);

        // Update SubArea counter safely
        SubArea subArea = pathChallenge.getSubArea();
        subArea.setCantidadPathChallenges(subArea.getCantidadPathChallenges() + 1);
        subAreaRepository.save(subArea);

        return getPathChallengeById(pathChallenge.getIdPathChallenge());
    }

    @Override
    @Transactional
    public PathChallengeResponseDTO updatePathChallenge(Integer id, PathChallengeRequestDTO request) {
        PathChallenge pathChallenge = pathChallengeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PathChallenge no encontrado"));

        Integer oldSubAreaId = pathChallenge.getSubArea().getIdSubarea();

        mapToEntity(request, pathChallenge);
        pathChallenge = pathChallengeRepository.save(pathChallenge);

        // Manage counter if subarea changed
        if (!oldSubAreaId.equals(request.getSubareaId())) {
            SubArea oldSubArea = subAreaRepository.findById(oldSubAreaId).orElse(null);
            if (oldSubArea != null && oldSubArea.getCantidadPathChallenges() > 0) {
                oldSubArea.setCantidadPathChallenges(oldSubArea.getCantidadPathChallenges() - 1);
                subAreaRepository.save(oldSubArea);
            }
            SubArea newSubArea = pathChallenge.getSubArea();
            newSubArea.setCantidadPathChallenges(newSubArea.getCantidadPathChallenges() + 1);
            subAreaRepository.save(newSubArea);
        }

        pathChallengeTaskRepository.deleteByPathChallenge_IdPathChallenge(pathChallenge.getIdPathChallenge());
        saveTasks(request.getTareas(), pathChallenge);

        return getPathChallengeById(pathChallenge.getIdPathChallenge());
    }

    @Override
    @Transactional
    public void deletePathChallenge(Integer id) {
        PathChallenge pathChallenge = pathChallengeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PathChallenge no encontrado"));

        pathChallengeTaskRepository.deleteByPathChallenge_IdPathChallenge(id);
        
        SubArea subArea = pathChallenge.getSubArea();
        if (subArea.getCantidadPathChallenges() > 0) {
            subArea.setCantidadPathChallenges(subArea.getCantidadPathChallenges() - 1);
            subAreaRepository.save(subArea);
        }
        
        pathChallengeRepository.delete(pathChallenge);
    }

    private void mapToEntity(PathChallengeRequestDTO request, PathChallenge pathChallenge) {
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
                PathChallengeTask task = new PathChallengeTask();
                task.setPathChallenge(pathChallenge);
                task.setDescripcion(tareaDTO.getDescripcion());
                task.setOrden(tareaDTO.getOrden() != null ? tareaDTO.getOrden() : i + 1);
                pathChallengeTaskRepository.save(task);
            }
        }
    }

    private PathChallengeResponseDTO mapToResponseDTO(PathChallenge pathChallenge) {
        List<PathChallengeTask> tareas = pathChallengeTaskRepository
                .findByPathChallenge_IdPathChallengeOrderByOrdenAsc(pathChallenge.getIdPathChallenge());

        List<PathChallengeTaskDTO> tareasDTO = tareas.stream().map(task -> {
            PathChallengeTaskDTO dto = new PathChallengeTaskDTO();
            dto.setIdPathChallengeTask(task.getIdPathChallengeTask());
            dto.setDescripcion(task.getDescripcion());
            dto.setOrden(task.getOrden());
            return dto;
        }).collect(Collectors.toList());

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
}
