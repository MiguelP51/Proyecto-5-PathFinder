package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "sub_area")
public class SubArea extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_subarea")
    private Integer idSubarea;

    @Column(name = "area_id", nullable = false, length = 50)
    private String areaId;

    @Column(name = "area_nombre", nullable = false, length = 100)
    private String areaNombre;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "objetivos", columnDefinition = "TEXT")
    private String objetivos;

    @Column(name = "habilidades_relacionadas", columnDefinition = "TEXT")
    private String habilidadesRelacionadas;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}