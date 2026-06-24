package com.pathfinder.dto.admin.disc;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OpcionPreguntaDISCRequestDTO {
    private String textoOpcion;
    private Integer valorRespuesta;
    private String imagenUrl;
    private Integer ordenOpcion;
    private String categoriaDisc;
}