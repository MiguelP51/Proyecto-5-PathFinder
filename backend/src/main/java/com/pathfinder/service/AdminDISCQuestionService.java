package com.pathfinder.service;

import com.pathfinder.dto.admin.disc.PreguntaDISCRequestDTO;
import com.pathfinder.dto.admin.disc.PreguntaDISCResponseDTO;
import com.pathfinder.model.enums.CategoriaDISC;

import java.util.List;

public interface AdminDISCQuestionService {

    List<PreguntaDISCResponseDTO> listarPreguntas(CategoriaDISC categoriaDisc);

    PreguntaDISCResponseDTO obtenerPregunta(Integer idPreguntaDisc);

    PreguntaDISCResponseDTO crearPregunta(PreguntaDISCRequestDTO request);

    PreguntaDISCResponseDTO actualizarPregunta(Integer idPreguntaDisc, PreguntaDISCRequestDTO request);

    void eliminarPregunta(Integer idPreguntaDisc);
}