package com.pathfinder.service;

import com.pathfinder.dto.student.pathchallenge.PathChallengeAvanceRequestDTO;
import com.pathfinder.dto.student.pathchallenge.PathChallengeEstudianteResponseDTO;
import com.pathfinder.dto.student.pathchallenge.PathChallengeFinalizarRequestDTO;

import java.util.List;

public interface PathChallengeEstudianteService {

    List<PathChallengeEstudianteResponseDTO> listarPorSubarea(
            String correo,
            Integer idSubarea
    );

    PathChallengeEstudianteResponseDTO obtenerDetalle(
            String correo,
            Integer idPathChallenge
    );

    PathChallengeEstudianteResponseDTO iniciar(
            String correo,
            Integer idPathChallenge
    );

    PathChallengeEstudianteResponseDTO guardarAvance(
            String correo,
            Integer idPathChallenge,
            PathChallengeAvanceRequestDTO request
    );

    PathChallengeEstudianteResponseDTO finalizar(
            String correo,
            Integer idPathChallenge,
            PathChallengeFinalizarRequestDTO request
    );
}