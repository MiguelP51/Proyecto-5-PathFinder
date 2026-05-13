package com.pathfinder.backend.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "experiencia_laboral")
public class ExperienciaLaboral extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_experiencia")
    private Integer idExperiencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_perfil_cv", nullable = false)
    private PerfilCV perfilCv;

    @Column(name = "empresa", length = 150)
    private String empresa;

    @Column(name = "cargo", length = 150)
    private String cargo;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "funciones_realizadas", columnDefinition = "TEXT")
    private String funcionesRealizadas;

    @Column(name = "logros_resultados", columnDefinition = "TEXT")
    private String logrosResultados;
}