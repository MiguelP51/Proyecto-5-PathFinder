package com.pathfinder.dto.admin.pathchallenge;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

import java.util.List;

@Data
public class PathChallengeTaskDTO {
    private Integer idPathChallengeTask;
    private String descripcion;
    private Integer orden;

    @JsonAlias("title")
    private String titulo;

    @JsonAlias("taskType")
    private String tipoTarea;

    @JsonAlias("content")
    private String contenido;

    @JsonAlias("optionsJson")
    private String opcionesJson;

    @JsonAlias("options")
    private List<String> opciones;

    @JsonAlias("required")
    private Boolean obligatoria;

    private String configJson;
}
