package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "disponibilidad_mentor")
public class DisponibilidadMentor extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_disponibilidad")
    private Integer idDisponibilidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_mentor", nullable = false)
    private Usuario mentor;

    @Column(name = "dia_semana", nullable = false, length = 20)
    private String diaSemana; // Lunes, Martes, Miércoles, etc.

    @Column(name = "hora_inicio", nullable = false, length = 10)
    private String horaInicio; // "09:00"

    @Column(name = "hora_fin", nullable = false, length = 10)
    private String horaFin; // "12:00"

    @Column(name = "tipo_entrevista", nullable = false, length = 20)
    private String tipoEntrevista; // "virtual", "presencial", "Ambos"
}
