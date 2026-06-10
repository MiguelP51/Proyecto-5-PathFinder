package com.pathfinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillPathActivoDTO {
    private Integer idSkillPath;
    private String titulo;
    private String plataforma;
    private Integer progreso;
    private String estado;
    private Integer xp;
}
