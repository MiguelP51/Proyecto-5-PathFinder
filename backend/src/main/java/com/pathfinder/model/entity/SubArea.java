package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "sub_area")
public class SubArea extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_subarea")
    private Integer idSubarea;

    @Column(name = "area_id", nullable = false, length = 50)
    private String areaId;

    @Column(name = "area_nombre", nullable = false, length = 100)
    private String areaNombre;

    @Column(name = "area_emoji", length = 10)
    private String areaEmoji;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "emoji", length = 10)
    private String emoji;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "objetivos", columnDefinition = "TEXT")
    private String objetivos;

    @Column(name = "habilidades_relacionadas", columnDefinition = "TEXT")
    private String habilidadesRelacionadas;

    @Column(name = "nivel", length = 20)
    private String nivel; // Principiante, Intermedio, Avanzado

    @Column(name = "cantidad_skillpaths", nullable = false)
    private Integer cantidadSkillPaths = 0;

    @Column(name = "cantidad_pathchallenges", nullable = false)
    private Integer cantidadPathChallenges = 0;

    @Column(name = "plataformas_skillpath", length = 255)
    private String plataformasSkillPath; // "Coursera, LinkedIn Learning"

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}