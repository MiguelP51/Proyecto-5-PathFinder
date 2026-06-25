package com.pathfinder.service;

import com.pathfinder.dto.request.SubmitEncuestaRequestDTO;
import com.pathfinder.dto.response.PreguntaResponseDTO;
import com.pathfinder.dto.response.EncuestaMentorFeedbackDTO;
import java.util.List;

public interface EncuestaService {
    List<PreguntaResponseDTO> obtenerPreguntasActivas();
    void guardarEncuesta(String correoEstudiante, SubmitEncuestaRequestDTO request);
    boolean tieneEncuestaCompletada(String correoEstudiante);
    boolean tieneEncuestaCompletada(String correoEstudiante, Integer idEntrevista);
    List<EncuestaMentorFeedbackDTO> obtenerFeedbackMentor(String correoMentor);
}
