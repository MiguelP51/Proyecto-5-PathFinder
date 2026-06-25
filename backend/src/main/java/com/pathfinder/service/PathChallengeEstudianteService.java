package com.pathfinder.service;

import com.pathfinder.dto.student.pathchallenge.PathChallengeAvanceRequestDTO;
import com.pathfinder.dto.student.pathchallenge.PathChallengeEstudianteResponseDTO;
import com.pathfinder.dto.student.pathchallenge.PathChallengeFinalizarRequestDTO;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface PathChallengeEstudianteService {

    List<PathChallengeEstudianteResponseDTO> listarIniciados(
            String correo
    );

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

    PathChallengeEstudianteResponseDTO subirArchivoTarea(
            String correo,
            Integer idPathChallenge,
            Integer idPathChallengeTask,
            MultipartFile file
    );

    byte[] descargarArchivoTarea(
            String correo,
            Integer idPathChallenge,
            Integer idPathChallengeTask
    );

    String obtenerNombreArchivoTarea(
            String correo,
            Integer idPathChallenge,
            Integer idPathChallengeTask
    );
}