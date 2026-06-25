package com.pathfinder.dto.admin.disc;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OpcionPreguntaDISCResponseDTO {
    private Integer idOpcionPreguntaDisc;
    private String textoOpcion;
    private Integer valorRespuesta;
    private String imagenUrl;
    private Integer ordenOpcion;
    private Boolean activo;
    private String categoriaDisc;
}