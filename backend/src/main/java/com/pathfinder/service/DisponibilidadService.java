package com.pathfinder.service;

import com.pathfinder.dto.response.DisponibilidadDTO;
import com.pathfinder.dto.response.MentorDisponibilidadDTO;
import com.pathfinder.dto.response.MentorDisponibilidadCompletaDTO;
import java.util.List;

public interface DisponibilidadService {
    List<DisponibilidadDTO> obtenerDisponibilidadMentor(String correoMentor);
    void guardarDisponibilidadMentor(String correoMentor, List<DisponibilidadDTO> disponibilidad);
    void eliminarDisponibilidad(Integer idDisponibilidad, String correoMentor);
    List<MentorDisponibilidadDTO> obtenerMentoresDisponibles();
    List<String> obtenerSlotsDisponibles(Integer idMentor, String fechaStr);
    
    // Configuración + Bloques
    MentorDisponibilidadCompletaDTO obtenerDisponibilidadCompleta(String correoMentor);
    void guardarDisponibilidadCompleta(String correoMentor, MentorDisponibilidadCompletaDTO dto);
}

