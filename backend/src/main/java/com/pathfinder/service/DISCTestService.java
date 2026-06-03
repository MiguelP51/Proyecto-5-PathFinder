package com.pathfinder.service;

import com.pathfinder.dto.admin.disc.PreguntaDISCResponseDTO;
import com.pathfinder.dto.request.RespuestaDISCRequestDTO;
import com.pathfinder.dto.response.ResultadoDISCResponseDTO;

import java.util.List;

public interface DISCTestService {

    List<PreguntaDISCResponseDTO> obtenerPreguntas(String correo);

    ResultadoDISCResponseDTO guardarRespuestas(String correo, List<RespuestaDISCRequestDTO> respuestas);

    ResultadoDISCResponseDTO obtenerResultado(String correo);
}
