package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "insignia")
public class Insignia extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_insignia")
    private Integer idInsignia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "emoji", length = 10)
    private String emoji;

    @Column(name = "color_fondo", length = 50)
    private String colorFondo; // ej: "bg-yellow-100"

    @Column(name = "fecha_obtenida", nullable = false)
    private String fechaObtenida; // ej: "9/2/2026"
}
