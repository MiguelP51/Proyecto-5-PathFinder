package com.pathfinder.model.entity;

import com.pathfinder.model.enums.TipoHabilidad;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "habilidad")
public class Habilidad extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_habilidad")
    private Integer idHabilidad;

    @Column(name = "nombre_habilidad", length = 100)
    private String nombreHabilidad;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_habilidad", length = 30)
    private TipoHabilidad tipoHabilidad;
}