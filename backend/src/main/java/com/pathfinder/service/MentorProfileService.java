package com.pathfinder.service;

import com.pathfinder.dto.request.MentorProfileRequest;
import com.pathfinder.dto.response.MentorProfileResponse;

public interface MentorProfileService {

    MentorProfileResponse obtenerPerfil(String correo);
    MentorProfileResponse obtenerPerfilPorId(Integer idUsuario);

    MentorProfileResponse guardarPerfil(String correo, MentorProfileRequest request);
}
