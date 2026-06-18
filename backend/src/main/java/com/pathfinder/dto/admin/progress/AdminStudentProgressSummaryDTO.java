package com.pathfinder.dto.admin.progress;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminStudentProgressSummaryDTO {
    private Integer idUsuario;
    private String nombre;
    private String correo;
    private String rol;
    private Integer progresoGeneralSkillPaths;
    private Integer totalSkillPathsIniciados;
    private Integer skillPathsCompletados;
    private Integer skillPathsEnProgreso;
    private Integer totalChallenges;
    private Integer challengesCompletados;
}
