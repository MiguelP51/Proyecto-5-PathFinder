package com.pathfinder.service;

import com.pathfinder.dto.response.SkillPathEstudianteResponseDTO;

import java.util.List;

public interface SkillPathService {

    List<SkillPathEstudianteResponseDTO> listarSkillPathsEstudiante(
            String correo,
            String subareaId
    );

    SkillPathEstudianteResponseDTO obtenerSkillPathEstudiantePorId(
            String correo,
            Integer idSkillPath
    );
}