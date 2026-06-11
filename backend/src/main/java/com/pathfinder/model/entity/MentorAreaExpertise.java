package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "mentor_area_expertise")
public class MentorAreaExpertise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_area_expertise")
    private Integer idAreaExpertise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_mentor_profile", nullable = false)
    private MentorProfile mentorProfile;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "anios_experiencia")
    private Integer aniosExperiencia;
}
