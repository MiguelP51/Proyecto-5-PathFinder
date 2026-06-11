package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "respuesta_diagnostico",
    uniqueConstraints = @UniqueConstraint(columnNames = {"id_diagnostico", "id_pregunta_diagnostico"})
)
public class RespuestaDiagnostico extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_respuesta_diagnostico")
    private Integer idRespuestaDiagnostico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_diagnostico", nullable = false)
    private DiagnosticoInicial diagnostico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pregunta_diagnostico", nullable = false)
    private PreguntaDiagnostico pregunta;

    @Column(name = "respuesta_elegida", nullable = false, length = 1)
    private String respuestaElegida; // "A", "B", "C" o "D"

    @Column(name = "es_correcta", nullable = false)
    private Boolean esCorrecta = false;
}
