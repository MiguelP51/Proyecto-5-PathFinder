package com.pathfinder.service.impl;

import com.pathfinder.dto.response.PublicAreaResponseDTO;
import com.pathfinder.dto.response.PublicStatsDTO;
import com.pathfinder.dto.response.PublicSubAreaResponseDTO;
import com.pathfinder.model.entity.Area;
import com.pathfinder.model.entity.SubArea;
import com.pathfinder.model.enums.RolUsuario;
import com.pathfinder.repository.AreaRepository;
import com.pathfinder.repository.SubAreaRepository;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.service.PublicExplorationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicExplorationServiceImpl implements PublicExplorationService {

    private final UsuarioRepository usuarioRepository;
    private final AreaRepository areaRepository;
    private final SubAreaRepository subAreaRepository;

    @Override
    @Transactional(readOnly = true)
    public PublicStatsDTO getPublicStats() {
        long totalStudents = usuarioRepository.findByRolAndActivoTrue(RolUsuario.USER).size();
        long totalAreas = areaRepository.findByActivoTrue().size();
        long totalSubareas = subAreaRepository.findByActivoTrue().size();

        return PublicStatsDTO.builder()
                .totalStudents(totalStudents)
                .totalAreas(totalAreas)
                .totalSubareas(totalSubareas)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PublicAreaResponseDTO> getPublicAreas() {
        List<Area> areas = areaRepository.findByActivoTrue();
        List<SubArea> subAreas = subAreaRepository.findByActivoTrue();

        Map<String, List<SubArea>> subAreasByAreaId = subAreas.stream()
                .collect(Collectors.groupingBy(SubArea::getAreaId));

        return areas.stream()
                .map(area -> mapToAreaDTO(area, subAreasByAreaId.getOrDefault(area.getIdArea(), new ArrayList<>())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PublicAreaResponseDTO getPublicAreaDetail(String idArea) {
        Area area = areaRepository.findByIdAreaAndActivoTrue(idArea)
                .orElseThrow(() -> new EntityNotFoundException("Área no encontrada o inactiva con ID: " + idArea));
        List<SubArea> subareas = subAreaRepository.findByAreaIdAndActivoTrue(idArea);

        return mapToAreaDTO(area, subareas);
    }

    private PublicAreaResponseDTO mapToAreaDTO(Area area, List<SubArea> subareas) {
        List<PublicSubAreaResponseDTO> subAreaDTOs = subareas.stream()
                .map(sa -> PublicSubAreaResponseDTO.builder()
                        .idSubarea(sa.getIdSubarea())
                        .nombre(sa.getNombre())
                        .emoji(sa.getEmoji())
                        .descripcion(sa.getDescripcion())
                        .nivel(sa.getNivel())
                        .cantidadSkillPaths(sa.getCantidadSkillPaths())
                        .cantidadPathChallenges(sa.getCantidadPathChallenges())
                        .plataformasSkillPath(sa.getPlataformasSkillPath())
                        .slug(sa.getSlug())
                        .build())
                .toList();

        return PublicAreaResponseDTO.builder()
                .idArea(area.getIdArea())
                .nombre(area.getNombre())
                .emoji(area.getEmoji())
                .descripcion(area.getDescripcion())
                .imagenUrl(area.getImagenUrl())
                .tagline(area.getTagline())
                .funciones(area.getFunciones())
                .colorFrom(area.getColorFrom())
                .colorTo(area.getColorTo())
                .subareas(subAreaDTOs)
                .build();
    }
}
