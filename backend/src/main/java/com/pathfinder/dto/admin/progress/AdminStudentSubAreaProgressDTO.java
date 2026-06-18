package com.pathfinder.dto.admin.progress;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminStudentSubAreaProgressDTO {
    private Integer idSubarea;
    private String slug;
    private String nombre;
    private String areaId;
    private String areaNombre;
    private String areaEmoji;
    private Boolean yaVisitada;
    private String diagnosticoEstado;
    private Integer diagnosticoPuntaje;
    private Integer totalSkillPaths;
    private Integer skillPathsIniciados;
    private Integer skillPathsCompletados;
    private Integer progresoPromedioSkillPaths;
}
