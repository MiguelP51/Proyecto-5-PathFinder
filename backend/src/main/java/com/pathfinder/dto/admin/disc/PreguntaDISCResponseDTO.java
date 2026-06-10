package com.pathfinder.dto.admin.disc;

import com.pathfinder.model.enums.CategoriaDISC;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PreguntaDISCResponseDTO {
    private Integer idPreguntaDisc;
    private String enunciado;
    private CategoriaDISC categoriaDisc;
    private Integer ordenPregunta;
    private String imagenUrl;
    private Boolean obligatoria;
    private Boolean activo;

    private Integer idTipoPreguntaDisc;
    private String codigoTipoPregunta;
    private String nombreTipoPregunta;

    private Integer cantidadOpciones;
    private List<OpcionPreguntaDISCResponseDTO> opciones;
}