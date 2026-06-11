package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "respuesta_encuesta")
public class RespuestaEncuesta extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_respuesta")
    private Integer idRespuesta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_estudiante", nullable = false)
    private Usuario estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pregunta", nullable = false)
    private PreguntaEncuesta pregunta;

    @Column(name = "valor_entero")
    private Integer valorEntero; // Para puntuaciones (1-5)

    @Column(name = "valor_texto", columnDefinition = "TEXT")
    private String valorTexto; // Para respuestas abiertas

    @Column(name = "fecha_completada")
    private LocalDateTime fechaCompletada;
}
