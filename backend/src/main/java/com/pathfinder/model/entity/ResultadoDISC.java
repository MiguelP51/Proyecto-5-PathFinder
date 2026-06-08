package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "resultado_disc")
public class ResultadoDISC extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_resultado_disc")
    private Integer idResultadoDisc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "puntaje_d", nullable = false)
    private Integer puntajeD;

    @Column(name = "puntaje_i", nullable = false)
    private Integer puntajeI;

    @Column(name = "puntaje_s", nullable = false)
    private Integer puntajeS;

    @Column(name = "puntaje_c", nullable = false)
    private Integer puntajeC;

    @Column(name = "perfil_dominante", nullable = false, length = 10)
    private String perfilDominante;

    @Column(name = "fecha_finalizacion", nullable = false)
    private LocalDateTime fechaFinalizacion;
}
