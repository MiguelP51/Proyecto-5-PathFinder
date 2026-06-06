package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "feriado")
public class Feriado extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_feriado")
    private Integer idFeriado;

    @Column(name = "fecha", nullable = false, unique = true)
    private LocalDate fecha;

    @Column(name = "descripcion", length = 150)
    private String descripcion;
}
