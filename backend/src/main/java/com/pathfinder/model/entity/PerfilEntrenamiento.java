package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "perfil_entrenamiento")
public class PerfilEntrenamiento extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_perfil_entrenamiento")
    private Integer idPerfilEntrenamiento;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "xp_total", nullable = false)
    private Integer xpTotal = 0;

    @Column(name = "nivel", nullable = false)
    private Integer nivel = 1;

    @Column(name = "xp_siguiente_nivel", nullable = false)
    private Integer xpSiguienteNivel = 1000;

    @Column(name = "exploracion_iniciada", nullable = false)
    private Boolean exploracionIniciada = false;
}
