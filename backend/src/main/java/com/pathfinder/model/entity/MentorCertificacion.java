package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "mentor_certificacion")
public class MentorCertificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_certificacion")
    private Integer idCertificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_mentor_profile", nullable = false)
    private MentorProfile mentorProfile;

    @Column(name = "titulo", nullable = false, length = 255)
    private String titulo;

    @Column(name = "emisor", length = 200)
    private String emisor;

    @Column(name = "anio", length = 10)
    private String anio;
}
