package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "perfil_cv")
public class PerfilCV extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_perfil_cv")
    private Integer idPerfilCv;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "celular", length = 20)
    private String celular;

    @Column(name = "correo_contacto", length = 150)
    private String correoContacto;

    @Column(name = "provincia", length = 100)
    private String provincia;

    @Column(name = "distrito", length = 100)
    private String distrito;

    @Column(name = "linkedin_url", length = 255)
    private String linkedinUrl;

    @Column(name = "perfil_profesional", columnDefinition = "TEXT")
    private String perfilProfesional;

    @Column(name = "intereses_profesionales", columnDefinition = "TEXT")
    private String interesesProfesionales;

    @Column(name = "objetivos_laborales", columnDefinition = "TEXT")
    private String objetivosLaborales;

    @Column(name = "fecha_actualizacion_cv")
    private LocalDateTime fechaActualizacionCv;
}