package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "entrevista_competencia")
public class EntrevistaCompetencia extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_entrevista_competencia")
    private Integer idEntrevistaCompetencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_entrevista", nullable = false)
    private Entrevista entrevista;

    @Column(name = "nombre_competencia", nullable = false, length = 150)
    private String nombreCompetencia;

    @Column(name = "nivel_seleccionado", nullable = false)
    private Integer nivelSeleccionado; // 0, 1, 2, 3

    @Column(name = "descripcion_nivel", columnDefinition = "TEXT")
    private String descripcionNivel;
}
