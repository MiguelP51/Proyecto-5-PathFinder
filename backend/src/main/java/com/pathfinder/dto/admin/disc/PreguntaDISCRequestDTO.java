package com.pathfinder.dto.admin.disc;

import com.pathfinder.model.enums.CategoriaDISC;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PreguntaDISCRequestDTO {
    private String enunciado;
    private CategoriaDISC categoriaDisc;
    private Integer idTipoPreguntaDisc;
    private Integer ordenPregunta;
    private String imagenUrl;
    private Boolean obligatoria;
    private List<OpcionPreguntaDISCRequestDTO> opciones;
}