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
}
