package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "competencia")
public class Competencia extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_competencia")
    private Integer idCompetencia;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "nivel_0", columnDefinition = "TEXT")
    private String nivel0;

    @Column(name = "nivel_1", columnDefinition = "TEXT")
    private String nivel1;

    @Column(name = "nivel_2", columnDefinition = "TEXT")
    private String nivel2;

    @Column(name = "nivel_3", columnDefinition = "TEXT")
    private String nivel3;

    @Column(name = "puesto", length = 150)
    private String puesto;
}
