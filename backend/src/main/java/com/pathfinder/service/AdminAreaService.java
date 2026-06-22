package com.pathfinder.service;

import com.pathfinder.dto.admin.area.AreaRequestDTO;
import com.pathfinder.dto.admin.area.AreaResponseDTO;
import com.pathfinder.dto.admin.subarea.SubAreaRequestDTO;
import com.pathfinder.dto.admin.subarea.SubAreaAdminResponseDTO;

import java.util.List;

public interface AdminAreaService {
    // Áreas
    List<AreaResponseDTO> listarAreas(Boolean soloActivos);
    AreaResponseDTO obtenerAreaPorId(String idArea);
    AreaResponseDTO crearArea(AreaRequestDTO request);
    AreaResponseDTO actualizarArea(String idArea, AreaRequestDTO request);
    AreaResponseDTO cambiarEstadoArea(String idArea, Boolean activo);
    String subirImagenArea(String idArea, org.springframework.web.multipart.MultipartFile file);
    byte[] descargarImagenArea(String idArea);

    // Subáreas
    List<SubAreaAdminResponseDTO> listarSubAreas(String areaId, Boolean soloActivos);
    SubAreaAdminResponseDTO obtenerSubAreaPorId(Integer idSubarea);
    SubAreaAdminResponseDTO crearSubArea(SubAreaRequestDTO request);
    SubAreaAdminResponseDTO actualizarSubArea(Integer idSubarea, SubAreaRequestDTO request);
    SubAreaAdminResponseDTO cambiarEstadoSubArea(Integer idSubarea, Boolean activo);
}
