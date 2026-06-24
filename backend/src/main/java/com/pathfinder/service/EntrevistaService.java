package com.pathfinder.service;

import com.pathfinder.dto.request.AgendarEntrevistaRequest;
import com.pathfinder.dto.response.EntrevistaResponseDTO;
import java.util.List;

public interface EntrevistaService {
    EntrevistaResponseDTO agendarEntrevista(String correoEstudiante, AgendarEntrevistaRequest request);
    EntrevistaResponseDTO obtenerEntrevistaActivaEstudiante(String correoEstudiante);
    List<EntrevistaResponseDTO> obtenerEntrevistasMentor(String correoMentor);
    boolean guardarEnlaceVirtual(Integer idEntrevista, String correoMentor, String virtualLink);
    void guardarFeedback(Integer idEntrevista, String correoMentor, com.pathfinder.dto.request.GuardarFeedbackRequest request);
    void cancelarOReagendarEntrevistaEstudiante(String correoEstudiante, String motivo, boolean esReagendado);
    void archivarEntrevistasEstudiante(String correoEstudiante);
}
