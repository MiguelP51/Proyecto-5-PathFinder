package com.pathfinder.model.entity;

import com.pathfinder.model.enums.NivelDominio;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "perfil_cv_habilidad")
public class PerfilCVHabilidad extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_perfil_cv_habilidad")
    private Integer idPerfilCvHabilidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_perfil_cv", nullable = false)
    private PerfilCV perfilCv;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_habilidad", nullable = false)
    private Habilidad habilidad;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel", length = 30)
    private NivelDominio nivel;
}