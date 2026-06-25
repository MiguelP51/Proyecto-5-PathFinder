package com.pathfinder.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PublicSubAreaResponseDTO {
    private Integer idSubarea;
    private String nombre;
    private String emoji;
    private String descripcion;
    private String nivel;
    private Integer cantidadSkillPaths;
    private Integer cantidadPathChallenges;
    private String plataformasSkillPath;
    private String slug;
}
