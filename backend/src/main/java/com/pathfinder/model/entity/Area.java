package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "area")
public class Area extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_area")
    private Integer idArea;

    @Column(name = "nombre_area", nullable = false, length = 100)
    private String nombreArea;

    @Column(name = "descripcion_general", columnDefinition = "TEXT")
    private String descripcionGeneral;

    @Column(name = "imagen_url", length = 255)
    private String imagenUrl;

    @Column(name = "icono_url", length = 255)
    private String iconoUrl;

    @OneToMany(mappedBy = "area", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Subarea> subareas = new ArrayList<>();
}