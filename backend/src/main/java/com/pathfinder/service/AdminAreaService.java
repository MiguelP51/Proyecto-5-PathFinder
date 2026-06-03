package com.pathfinder.service;

import com.pathfinder.dto.admin.area.AreaRequestDTO;
import com.pathfinder.dto.admin.area.AreaResponseDTO;
import com.pathfinder.dto.admin.area.SubareaRequestDTO;
import com.pathfinder.dto.admin.area.SubareaResponseDTO;

import java.util.List;

public interface AdminAreaService {

    List<AreaResponseDTO> listarAreas();

    AreaResponseDTO obtenerArea(Integer idArea);

    AreaResponseDTO crearArea(AreaRequestDTO request);

    AreaResponseDTO actualizarArea(Integer idArea, AreaRequestDTO request);

    AreaResponseDTO actualizarEstadoArea(Integer idArea, Boolean activo);

    List<SubareaResponseDTO> listarSubareasPorArea(Integer idArea);

    SubareaResponseDTO crearSubarea(Integer idArea, SubareaRequestDTO request);

    SubareaResponseDTO actualizarSubarea(Integer idSubarea, SubareaRequestDTO request);

    SubareaResponseDTO actualizarEstadoSubarea(Integer idSubarea, Boolean activo);
}