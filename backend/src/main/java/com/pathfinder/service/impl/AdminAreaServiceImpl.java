package com.pathfinder.service.impl;

import com.pathfinder.dto.admin.area.AreaRequestDTO;
import com.pathfinder.dto.admin.area.AreaResponseDTO;
import com.pathfinder.dto.admin.area.SubareaRequestDTO;
import com.pathfinder.dto.admin.area.SubareaResponseDTO;
import com.pathfinder.model.entity.Area;
import com.pathfinder.model.entity.Subarea;
import com.pathfinder.repository.AreaRepository;
import com.pathfinder.repository.SubareaRepository;
import com.pathfinder.service.AdminAreaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAreaServiceImpl implements AdminAreaService {

    private final AreaRepository areaRepository;
    private final SubareaRepository subareaRepository;

    @Override
    public List<AreaResponseDTO> listarAreas() {
        return areaRepository.findByActivoTrueOrderByNombreAreaAsc()
                .stream()
                .map(this::toAreaResponse)
                .toList();
    }

    @Override
    public AreaResponseDTO obtenerArea(Integer idArea) {
        Area area = buscarAreaActiva(idArea);
        return toAreaResponse(area);
    }

    @Override
    public AreaResponseDTO crearArea(AreaRequestDTO request) {
        validarArea(request);

        if (areaRepository.existsByNombreAreaIgnoreCaseAndActivoTrue(request.getNombreArea().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe un área activa con ese nombre");
        }

        Area area = new Area();
        area.setNombreArea(request.getNombreArea().trim());
        area.setDescripcionGeneral(request.getDescripcionGeneral());
        area.setImagenUrl(request.getImagenUrl());
        area.setIconoUrl(request.getIconoUrl());
        area.setActivo(true);

        return toAreaResponse(areaRepository.save(area));
    }

    @Override
    public AreaResponseDTO actualizarArea(Integer idArea, AreaRequestDTO request) {
        validarArea(request);

        Area area = buscarAreaActiva(idArea);
        area.setNombreArea(request.getNombreArea().trim());
        area.setDescripcionGeneral(request.getDescripcionGeneral());
        area.setImagenUrl(request.getImagenUrl());
        area.setIconoUrl(request.getIconoUrl());

        return toAreaResponse(areaRepository.save(area));
    }

    @Override
    public AreaResponseDTO actualizarEstadoArea(Integer idArea, Boolean activo) {
        if (activo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El estado activo es obligatorio");
        }

        Area area = areaRepository.findById(idArea)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró el área solicitada"));

        area.setActivo(activo);

        return toAreaResponse(areaRepository.save(area));
    }

    @Override
    public List<SubareaResponseDTO> listarSubareasPorArea(Integer idArea) {
        buscarAreaActiva(idArea);

        return subareaRepository.findByAreaIdAreaAndActivoTrueOrderByNombreSubareaAsc(idArea)
                .stream()
                .map(this::toSubareaResponse)
                .toList();
    }

    @Override
    public SubareaResponseDTO crearSubarea(Integer idArea, SubareaRequestDTO request) {
        validarSubarea(request);

        Area area = buscarAreaActiva(idArea);

        if (subareaRepository.existsByAreaIdAreaAndNombreSubareaIgnoreCaseAndActivoTrue(
                idArea,
                request.getNombreSubarea().trim()
        )) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe una subárea activa con ese nombre en el área seleccionada");
        }

        Subarea subarea = new Subarea();
        subarea.setArea(area);
        subarea.setNombreSubarea(request.getNombreSubarea().trim());
        subarea.setDescripcionGeneral(request.getDescripcionGeneral());
        subarea.setImagenUrl(request.getImagenUrl());
        subarea.setIconoUrl(request.getIconoUrl());
        subarea.setActivo(true);

        return toSubareaResponse(subareaRepository.save(subarea));
    }

    @Override
    public SubareaResponseDTO actualizarSubarea(Integer idSubarea, SubareaRequestDTO request) {
        validarSubarea(request);

        Subarea subarea = buscarSubareaActiva(idSubarea);
        subarea.setNombreSubarea(request.getNombreSubarea().trim());
        subarea.setDescripcionGeneral(request.getDescripcionGeneral());
        subarea.setImagenUrl(request.getImagenUrl());
        subarea.setIconoUrl(request.getIconoUrl());

        return toSubareaResponse(subareaRepository.save(subarea));
    }

    @Override
    public SubareaResponseDTO actualizarEstadoSubarea(Integer idSubarea, Boolean activo) {
        if (activo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El estado activo es obligatorio");
        }

        Subarea subarea = subareaRepository.findById(idSubarea)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró la subárea solicitada"));

        subarea.setActivo(activo);

        return toSubareaResponse(subareaRepository.save(subarea));
    }

    private Area buscarAreaActiva(Integer idArea) {
        return areaRepository.findById(idArea)
                .filter(area -> Boolean.TRUE.equals(area.getActivo()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró el área solicitada"));
    }

    private Subarea buscarSubareaActiva(Integer idSubarea) {
        return subareaRepository.findById(idSubarea)
                .filter(subarea -> Boolean.TRUE.equals(subarea.getActivo()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró la subárea solicitada"));
    }

    private void validarArea(AreaRequestDTO request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El área es obligatoria");
        }

        if (request.getNombreArea() == null || request.getNombreArea().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre del área es obligatorio");
        }
    }

    private void validarSubarea(SubareaRequestDTO request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La subárea es obligatoria");
        }

        if (request.getNombreSubarea() == null || request.getNombreSubarea().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre de la subárea es obligatorio");
        }
    }

    private AreaResponseDTO toAreaResponse(Area area) {
        List<SubareaResponseDTO> subareas = area.getSubareas() == null
                ? List.of()
                : area.getSubareas()
                .stream()
                .filter(subarea -> Boolean.TRUE.equals(subarea.getActivo()))
                .sorted(Comparator.comparing(Subarea::getNombreSubarea, Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(this::toSubareaResponse)
                .toList();

        return AreaResponseDTO.builder()
                .idArea(area.getIdArea())
                .nombreArea(area.getNombreArea())
                .descripcionGeneral(area.getDescripcionGeneral())
                .imagenUrl(area.getImagenUrl())
                .iconoUrl(area.getIconoUrl())
                .activo(area.getActivo())
                .cantidadSubareas(subareas.size())
                .subareas(subareas)
                .build();
    }

    private SubareaResponseDTO toSubareaResponse(Subarea subarea) {
        Area area = subarea.getArea();

        return SubareaResponseDTO.builder()
                .idSubarea(subarea.getIdSubarea())
                .idArea(area != null ? area.getIdArea() : null)
                .nombreArea(area != null ? area.getNombreArea() : null)
                .nombreSubarea(subarea.getNombreSubarea())
                .descripcionGeneral(subarea.getDescripcionGeneral())
                .imagenUrl(subarea.getImagenUrl())
                .iconoUrl(subarea.getIconoUrl())
                .activo(subarea.getActivo())
                .build();
    }
}