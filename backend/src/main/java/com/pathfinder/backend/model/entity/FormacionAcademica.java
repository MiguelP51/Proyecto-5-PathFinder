package com.pathfinder.backend.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "formacion_academica")
public class FormacionAcademica extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_formacion")
    private Integer idFormacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_perfil_cv", nullable = false)
    private PerfilCV perfilCv;

    @Column(name = "institucion", length = 150)
    private String institucion;

    @Column(name = "carrera", length = 150)
    private String carrera;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "cursos_relevantes", columnDefinition = "TEXT")
    private String cursosRelevantes;
}