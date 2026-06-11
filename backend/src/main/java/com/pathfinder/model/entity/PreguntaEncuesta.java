package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "pregunta_encuesta")
public class PreguntaEncuesta extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pregunta")
    private Integer idPregunta;

    @Column(name = "texto_pregunta", nullable = false, columnDefinition = "TEXT")
    private String textoPregunta;

    @Column(name = "tipo_pregunta", nullable = false, length = 20)
    private String tipoPregunta; // "RATING" or "TEXT"

    @Column(name = "obligatoria", nullable = false)
    private Boolean obligatoria;
}
