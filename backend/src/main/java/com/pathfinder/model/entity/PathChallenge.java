package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "path_challenge")
public class PathChallenge extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_path_challenge")
    private Integer idPathChallenge;

    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @Column(name = "dificultad", length = 50)
    private String dificultad; // Facil, Media, Dificil

    @Column(name = "xp", nullable = false)
    private Integer xp = 0;

    @Column(name = "estado", length = 50)
    private String estado; // Borrador, Publicada

    @Column(name = "completadas", nullable = false)
    private Integer completadas = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subarea_id", nullable = false)
    private SubArea subArea;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "path_challenge_habilidad",
            joinColumns = @JoinColumn(name = "path_challenge_id"),
            inverseJoinColumns = @JoinColumn(name = "habilidad_id")
    )
    private List<Habilidad> habilidades;
}
