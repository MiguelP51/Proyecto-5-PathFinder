package com.pathfinder.service;

import com.pathfinder.dto.response.SkillPathEstudianteResponseDTO;
import org.springframework.web.multipart.MultipartFile;

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

    SkillPathEstudianteResponseDTO iniciarSkillPathEstudiante(
            String correo,
            Integer idSkillPath
    );

    SkillPathEstudianteResponseDTO subirEvidenciaSkillPath(
            String correo,
            Integer idSkillPath,
            MultipartFile file
    );

    SkillPathEstudianteResponseDTO eliminarEvidenciaSkillPath(
            String correo,
            Integer idSkillPath
    );

    List<SkillPathEstudianteResponseDTO> listarSkillPathsIniciadosEstudiante(
            String correo
    );
}