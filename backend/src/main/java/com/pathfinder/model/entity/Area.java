package com.pathfinder.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "area")
public class Area extends AuditoriaBase {

    @Id
    @Column(name = "id_area", length = 50)
    private String idArea; // Identificador / Slug único, ej. "recursos-humanos", "marketing"

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "emoji", length = 10)
    private String emoji;
}
