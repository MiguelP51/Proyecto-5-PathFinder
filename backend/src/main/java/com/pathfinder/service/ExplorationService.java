package com.pathfinder.service;

import com.pathfinder.dto.response.SubAreaResponseDTO;
import java.util.List;

public interface ExplorationService {
    List<SubAreaResponseDTO> getSubAreasByArea(String areaId, Integer idUsuario);
    SubAreaResponseDTO getSubAreaDetalle(Integer idSubarea, Integer idUsuario);
    void registrarVisita(Integer idSubarea, Integer idUsuario);
}