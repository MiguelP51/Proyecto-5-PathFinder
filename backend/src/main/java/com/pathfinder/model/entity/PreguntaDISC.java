package com.pathfinder.model.entity;

import com.pathfinder.model.enums.CategoriaDISC;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "pregunta_disc")
public class PreguntaDISC extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pregunta_disc")
    private Integer idPreguntaDisc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_pregunta_disc", nullable = false)
    private TipoPreguntaDISC tipoPreguntaDisc;

    @Column(name = "enunciado", columnDefinition = "TEXT", nullable = false)
    private String enunciado;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria_disc", nullable = false, length = 1)
    private CategoriaDISC categoriaDisc;

    @Column(name = "orden_pregunta")
    private Integer ordenPregunta;

    @Column(name = "imagen_url", length = 255)
    private String imagenUrl;

    @Column(name = "obligatoria")
    private Boolean obligatoria = true;

    @OneToMany(mappedBy = "preguntaDisc", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OpcionPreguntaDISC> opciones = new ArrayList<>();
}