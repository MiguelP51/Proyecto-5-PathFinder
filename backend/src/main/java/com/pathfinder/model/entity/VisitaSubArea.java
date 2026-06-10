package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
    name = "visita_sub_area",
    uniqueConstraints = @UniqueConstraint(columnNames = {"id_usuario", "id_subarea"})
)
public class VisitaSubArea extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_visita")
    private Integer idVisita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_subarea", nullable = false)
    private SubArea subArea;

    @Column(name = "fecha_primer_acceso", nullable = false)
    private LocalDateTime fechaPrimerAcceso;
}