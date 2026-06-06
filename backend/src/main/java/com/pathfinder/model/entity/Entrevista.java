package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "entrevista")
public class Entrevista extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_entrevista")
    private Integer idEntrevista;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_estudiante", nullable = false)
    private Usuario estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_mentor", nullable = false)
    private Usuario mentor;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "hora", nullable = false, length = 10)
    private String hora; // "10:00"

    @Column(name = "tipo", nullable = false, length = 20)
    private String tipo; // "virtual", "presencial"

    @Column(name = "estado", nullable = false, length = 20)
    private String estado; // "Programada", "Completada", "Cancelada"

    @Column(name = "enlace_virtual", length = 255)
    private String virtualLink; // Meeting link Zoom/Meet

    // Campos de evaluación (Feedback) - HU-PM-06
    @Column(name = "resultado", length = 50)
    private String resultado; // "Aprobado", "Requiere Mejora", "Con Observaciones"

    @Column(name = "feedback_comentarios", columnDefinition = "TEXT")
    private String feedbackComentarios;

    @Column(name = "competencia_comunicacion")
    private Integer competenciaComunicacion; // 1 a 5 estrellas

    @Column(name = "competencia_tecnica")
    private Integer competenciaTecnica; // 1 a 5 estrellas

    @Column(name = "competencia_proactividad")
    private Integer competenciaProactividad; // 1 a 5 estrellas

    @Column(name = "competencia_resolucion")
    private Integer competenciaResolucion; // 1 a 5 estrellas

    @Column(name = "motivo_cancelacion", length = 500)
    private String motivoCancelacion;
}

