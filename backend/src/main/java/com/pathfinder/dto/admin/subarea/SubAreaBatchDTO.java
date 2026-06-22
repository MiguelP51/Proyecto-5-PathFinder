package com.pathfinder.dto.admin.subarea;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubAreaBatchDTO {
    private Integer idSubarea; // Null si es creación nueva en lote
    private String areaId;     // ID del área asociada
    private String nombre;     // Nombre de la subárea
    private String emoji;
    private String descripcion;
    private String objetivos;
    private String habilidadesRelacionadas;
    private String nivel;      // Principiante, Intermedio, Avanzado
    private String plataformasSkillPath;
    private String slug;
    private Boolean activo;
}
