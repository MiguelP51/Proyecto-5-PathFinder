package com.pathfinder.dto.response;

import com.pathfinder.model.enums.EstadoEtapa;
import com.pathfinder.model.enums.NombreEtapa;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class EstadoEstudianteResponse {

    private Boolean tienePerfilCV;

    private Boolean perfilConfirmado;

    private NombreEtapa etapaActual;

    private Map<NombreEtapa, EstadoEtapa> etapas;

    private Boolean exploracionIniciada;
}