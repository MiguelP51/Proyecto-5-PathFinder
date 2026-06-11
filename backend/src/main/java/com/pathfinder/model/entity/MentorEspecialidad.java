package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "mentor_especialidad")
public class MentorEspecialidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_especialidad")
    private Integer idEspecialidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_mentor_profile", nullable = false)
    private MentorProfile mentorProfile;

    @Column(name = "nombre", nullable = false, length = 200)
    private String nombre;
}
