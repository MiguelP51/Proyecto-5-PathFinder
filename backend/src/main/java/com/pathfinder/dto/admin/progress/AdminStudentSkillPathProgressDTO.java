package com.pathfinder.dto.admin.progress;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminStudentSkillPathProgressDTO {
    private Integer idSkillPath;
    private String titulo;
    private String plataforma;
    private String areaId;
    private String areaNombre;
    private String subareaId;
    private String subareaNombre;
    private String estado;
    private Integer progreso;
    private Integer xp;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaCompletado;
    private LocalDateTime fechaValidacion;
}
