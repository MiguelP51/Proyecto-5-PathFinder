package com.pathfinder.model.entity;

import com.pathfinder.model.enums.NivelDominio;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "perfil_cv_idioma")
public class PerfilCVIdioma extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_perfil_cv_idioma")
    private Integer idPerfilCvIdioma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_perfil_cv", nullable = false)
    private PerfilCV perfilCv;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_idioma", nullable = false)
    private Idioma idioma;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel", length = 30)
    private NivelDominio nivel;
}