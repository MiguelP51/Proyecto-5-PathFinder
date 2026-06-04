package com.pathfinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorDisponibilidadCompletaDTO {
    private Integer duracionEntrevista;
    private Integer tiempoEntreEntrevistas;
    private Integer maxEntrevistasDia;
    private List<String> diasDisponibles;
    private List<DisponibilidadDTO> bloques;
}
