package com.pathfinder.service;

import com.pathfinder.dto.request.ResponderPreguntaRequest;
import com.pathfinder.dto.response.DiagnosticoIniciadoDTO;
import com.pathfinder.dto.response.DiagnosticoResultadoDTO;
import com.pathfinder.dto.response.DiagnosticoEstadoDTO;

public interface DiagnosticoService {
    DiagnosticoIniciadoDTO iniciarDiagnostico(Integer idSubarea, Integer idUsuario);
    void responderPregunta(Integer idDiagnostico, ResponderPreguntaRequest request, Integer idUsuario);
    DiagnosticoResultadoDTO finalizarDiagnostico(Integer idDiagnostico, Integer idUsuario);
    DiagnosticoResultadoDTO obtenerResultado(Integer idDiagnostico, Integer idUsuario);
    DiagnosticoEstadoDTO obtenerUltimoDiagnosticoSubarea(Integer idSubarea, Integer idUsuario);
}
