package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "pregunta_diagnostico")
public class PreguntaDiagnostico extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pregunta_diagnostico")
    private Integer idPreguntaDiagnostico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_subarea", nullable = false)
    private SubArea subArea;

    @Column(name = "enunciado", columnDefinition = "TEXT", nullable = false)
    private String enunciado;

    @Column(name = "opcion_a", nullable = false, length = 255)
    private String opcionA;

    @Column(name = "opcion_b", nullable = false, length = 255)
    private String opcionB;

    @Column(name = "opcion_c", nullable = false, length = 255)
    private String opcionC;

    @Column(name = "opcion_d", nullable = false, length = 255)
    private String opcionD;

    @Column(name = "respuesta_correcta", nullable = false, length = 1)
    private String respuestaCorrecta; // "A", "B", "C" o "D"

    @Column(name = "orden", nullable = false)
    private Integer orden = 1;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}
