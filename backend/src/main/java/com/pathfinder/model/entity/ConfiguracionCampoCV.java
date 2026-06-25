package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "configuracion_campo_cv")
public class ConfiguracionCampoCV extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_campo")
    private Integer idCampo;

    @Column(name = "clave", nullable = false, unique = true, length = 100)
    private String clave;

    @Column(name = "label", nullable = false, length = 150)
    private String label;

    @Column(name = "tipo", nullable = false, length = 50)
    private String tipo; // "TEXT", "TEXTAREA"

    @Column(name = "requerido", nullable = false)
    private Boolean requerido = false;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "orden", nullable = false)
    private Integer orden = 0;

    @Column(name = "es_custom", nullable = false)
    private Boolean esCustom = false;
}
