package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "respuesta_pregunta_disc")
public class RespuestaPreguntaDISC extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_respuesta_pregunta_disc")
    private Integer idRespuestaPreguntaDisc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pregunta_disc", nullable = false)
    private PreguntaDISC preguntaDisc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_opcion_pregunta_disc")
    private OpcionPreguntaDISC opcionPreguntaDisc;

    @Column(name = "valor_respuesta", nullable = false)
    private Integer valorRespuesta;

    @Column(name = "respuesta_texto", columnDefinition = "TEXT")
    private String respuestaTexto;
}
