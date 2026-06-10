package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "diagnostico_inicial")
public class DiagnosticoInicial extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_diagnostico")
    private Integer idDiagnostico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_subarea", nullable = false)
    private SubArea subArea;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "EN_PROGRESO"; // EN_PROGRESO, COMPLETADO

    @Column(name = "puntaje")
    private Integer puntaje = 0; // 0 a 100

    @Column(name = "total_preguntas")
    private Integer totalPreguntas = 0;

    @Column(name = "respuestas_correctas")
    private Integer respuestasCorrectas = 0;

    @Column(name = "nivel_recomendado", length = 20)
    private String nivelRecomendado; // Principiante, Intermedio, Avanzado

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;
}
