package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "opcion_pregunta_disc")
public class OpcionPreguntaDISC extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_opcion_pregunta_disc")
    private Integer idOpcionPreguntaDisc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pregunta_disc", nullable = false)
    private PreguntaDISC preguntaDisc;

    @Column(name = "texto_opcion", length = 255)
    private String textoOpcion;

    @Column(name = "valor_respuesta")
    private Integer valorRespuesta;

    @Column(name = "imagen_url", length = 255)
    private String imagenUrl;

    @Column(name = "orden_opcion")
    private Integer ordenOpcion;
}