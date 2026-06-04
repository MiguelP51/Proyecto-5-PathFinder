package com.pathfinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisponibilidadDTO {
    private Integer idDisponibilidad;
    private String diaSemana;
    private String horaInicio;
    private String horaFin;
    private String tipoEntrevista;
}
