package com.pathfinder.dto.admin.pathchallenge;

import lombok.Data;
import java.util.List;

@Data
public class PathChallengeRequestDTO {
    private String titulo;
    private String dificultad;
    private Integer xp;
    private String estado;
    private Integer subareaId;
    private List<Integer> habilidadesIds;
    private List<PathChallengeTaskDTO> tareas;
}
