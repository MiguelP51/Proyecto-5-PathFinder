package com.pathfinder.dto.admin.manage_skillpath;

import lombok.Data;

@Data
public class UpdateAdminManageSkillPathRequestDTO {
    private String titulo;
    private String plataforma;
    private String descripcion;
    private String urlExterno;
    private String dificultad;
    private String duracionLabel;
    private String areaId;
    private String areaNombre;
    private String subareaId;
    private String subareaNombre;
    private Boolean esRecomendado;
}
