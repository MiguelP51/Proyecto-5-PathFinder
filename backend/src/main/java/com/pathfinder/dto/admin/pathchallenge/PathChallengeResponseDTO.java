package com.pathfinder.dto.admin.pathchallenge;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PathChallengeResponseDTO {
    private Integer idPathChallenge;
    private String titulo;
    private String dificultad;
    private Integer xp;
    private String estado;
    private Integer completadas;
    private Integer subareaId;
    private String subareaNombre;
    private List<String> tags; // Habilidades nombres
    private Integer tareasCount;
    private List<PathChallengeTaskDTO> tareas;
}
