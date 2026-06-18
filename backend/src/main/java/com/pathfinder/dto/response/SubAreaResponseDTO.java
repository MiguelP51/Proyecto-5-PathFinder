package com.pathfinder.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SubAreaResponseDTO {
    private Integer idSubarea;
    private String areaId;
    private String areaNombre;
    private String areaEmoji;
    private String nombre;
    private String emoji;
    private String descripcion;
    private String objetivos;
    private String habilidadesRelacionadas;
    private String nivel;
    private Integer cantidadSkillPaths;
    private Integer cantidadPathChallenges;
    private String plataformasSkillPath;
    private Boolean yaVisitada;
    private Boolean diagnosticoIniciado;
    private Boolean diagnosticoCompletado;
    private String slug;
}