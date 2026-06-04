package com.pathfinder.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultadoDISCResponseDTO {
    private Integer idResultadoDisc;
    private Integer idUsuario;
    private Integer puntajeD;
    private Integer puntajeI;
    private Integer puntajeS;
    private Integer puntajeC;
    private Integer porcentajeD;
    private Integer porcentajeI;
    private Integer porcentajeS;
    private Integer porcentajeC;
    private String perfilDominante;
    private String nombrePerfil;
    private String descripcion;
    private List<String> fortalezas;
    private List<String> habilidadesSugeridas;
    private LocalDateTime fechaFinalizacion;
}
