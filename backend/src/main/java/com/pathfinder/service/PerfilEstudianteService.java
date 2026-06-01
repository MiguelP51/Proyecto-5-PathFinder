package com.pathfinder.service;

import com.pathfinder.dto.request.GuardarPerfilRequest;
import com.pathfinder.dto.response.EstadoEstudianteResponse;
import com.pathfinder.dto.response.PerfilEstudianteResponse;

public interface PerfilEstudianteService {

    EstadoEstudianteResponse obtenerEstado(String correo);

    PerfilEstudianteResponse obtenerPerfil(String correo);

    PerfilEstudianteResponse guardarPerfil(
            String correo,
            GuardarPerfilRequest request
    );

    EstadoEstudianteResponse confirmarPerfil(String correo);
}