package com.pathfinder.dto.admin.manage_skillpath;

import com.pathfinder.model.entity.SkillPath;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminManageSkillPathResponseDTO {
    private Integer idSkillPath;
    private String titulo;
    private String plataforma;
    private String descripcion;
    private String urlExterno;
    private Integer progreso;
    private String estado;
    private Integer xp;
    private String dificultad;
    private String duracionLabel;
    private String areaId;
    private String areaNombre;
    private String subareaId;
    private String subareaNombre;
    private Boolean esRecomendado;
    private Boolean activo;
    private String usuarioCorreo;
    private String usuarioNombre;

    public static AdminManageSkillPathResponseDTO from(SkillPath skillPath) {
        return AdminManageSkillPathResponseDTO.builder()
                .idSkillPath(skillPath.getIdSkillPath())
                .titulo(skillPath.getTitulo())
                .plataforma(skillPath.getPlataforma())
                .descripcion(skillPath.getDescripcion())
                .urlExterno(skillPath.getUrlExterno())
                .progreso(skillPath.getProgreso())
                .estado(skillPath.getEstado())
                .xp(skillPath.getXp())
                .dificultad(skillPath.getDificultad())
                .duracionLabel(skillPath.getDuracionLabel())
                .areaId(skillPath.getAreaId())
                .areaNombre(skillPath.getAreaNombre())
                .subareaId(skillPath.getSubareaId())
                .subareaNombre(skillPath.getSubareaNombre())
                .esRecomendado(skillPath.getEsRecomendado())
                .activo(skillPath.getActivo())
                .usuarioCorreo(skillPath.getUsuario() != null ? skillPath.getUsuario().getCorreo() : null)
                .usuarioNombre(skillPath.getUsuario() != null ? skillPath.getUsuario().getNombreCompleto() : null)
                .build();
    }
}
