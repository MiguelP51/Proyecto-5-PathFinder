package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "mentor_profile")
public class MentorProfile extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mentor_profile")
    private Integer idMentorProfile;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_mentor", nullable = false, unique = true)
    private Usuario mentor;

    @Column(name = "titulo", length = 200)
    private String titulo;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "ubicacion", length = 200)
    private String ubicacion;

    @Column(name = "linkedin_url", length = 255)
    private String linkedinUrl;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @OneToMany(mappedBy = "mentorProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MentorAreaExpertise> areasExpertise = new ArrayList<>();

    @OneToMany(mappedBy = "mentorProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MentorCertificacion> certificaciones = new ArrayList<>();

    @OneToMany(mappedBy = "mentorProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MentorEspecialidad> especialidades = new ArrayList<>();
}
