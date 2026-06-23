package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "path_challenge_task")
public class PathChallengeTask extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_path_challenge_task")
    private Integer idPathChallengeTask;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "path_challenge_id", nullable = false)
    private PathChallenge pathChallenge;

    @Column(name = "descripcion", columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    @Column(name = "orden", nullable = false)
    private Integer orden;

    @Column(name = "titulo", length = 150)
    private String titulo;

    @Column(name = "tipo_tarea", nullable = false, length = 30)
    private String tipoTarea = "INFORMATION";

    @Column(name = "contenido", columnDefinition = "TEXT")
    private String contenido;

    @Column(name = "opciones_json", columnDefinition = "TEXT")
    private String opcionesJson;

    @Column(name = "obligatoria", nullable = false)
    private Boolean obligatoria = true;
}
