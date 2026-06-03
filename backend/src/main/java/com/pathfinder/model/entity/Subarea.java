package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "subarea")
public class Subarea extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_subarea")
    private Integer idSubarea;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_area", nullable = false)
    private Area area;

    @Column(name = "nombre_subarea", nullable = false, length = 100)
    private String nombreSubarea;

    @Column(name = "descripcion_general", columnDefinition = "TEXT")
    private String descripcionGeneral;

    @Column(name = "imagen_url", length = 255)
    private String imagenUrl;

    @Column(name = "icono_url", length = 255)
    private String iconoUrl;
}