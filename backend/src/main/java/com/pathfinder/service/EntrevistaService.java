package com.pathfinder.service;

import com.pathfinder.dto.request.AgendarEntrevistaRequest;
import com.pathfinder.dto.response.EntrevistaResponseDTO;
import java.util.List;

public interface EntrevistaService {
    EntrevistaResponseDTO agendarEntrevista(String correoEstudiante, AgendarEntrevistaRequest request);
    EntrevistaResponseDTO obtenerEntrevistaActivaEstudiante(String correoEstudiante);
    List<EntrevistaResponseDTO> obtenerEntrevistasMentor(String correoMentor);
    void guardarEnlaceVirtual(Integer idEntrevista, String correoMentor, String virtualLink);
    void guardarFeedback(Integer idEntrevista, String correoMentor, String resultado, String feedback, Integer comunicacion, Integer tecnica, Integer proactividad, Integer resolucion);
}
