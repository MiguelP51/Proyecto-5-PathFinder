package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "skill_path")
public class SkillPath extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_skill_path")
    private Integer idSkillPath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "titulo", nullable = false, length = 255)
    private String titulo;

    @Column(name = "plataforma", nullable = false, length = 100)
    private String plataforma;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "url_externo", length = 500)
    private String urlExterno;

    @Column(name = "progreso", nullable = false)
    private Integer progreso = 0; // 0 a 100

    @Column(name = "estado", nullable = false, length = 30)
    private String estado = "DISPONIBLE"; // DISPONIBLE, EN_PROGRESO, COMPLETADO, CERTIFICADO_PENDIENTE, VALIDADO

    @Column(name = "xp", nullable = false)
    private Integer xp = 0;

    @Column(name = "dificultad", length = 20)
    private String dificultad; // BASICO, INTERMEDIO, AVANZADO

    @Column(name = "duracion_label", length = 50)
    private String duracionLabel;

    @Column(name = "area_id", length = 50)
    private String areaId;

    @Column(name = "area_nombre", length = 100)
    private String areaNombre;

    @Column(name = "subarea_id", length = 50)
    private String subareaId;

    @Column(name = "subarea_nombre", length = 100)
    private String subareaNombre;

    @Column(name = "es_recomendado")
    private Boolean esRecomendado = false;
}
