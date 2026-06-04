package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "configuracion_disponibilidad_mentor")
public class ConfiguracionDisponibilidadMentor extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_configuracion")
    private Integer idConfiguracion;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_mentor", nullable = false, unique = true)
    private Usuario mentor;

    @Column(name = "duracion_entrevista", nullable = false)
    private Integer duracionEntrevista; // En minutos: 60, 30, etc.

    @Column(name = "tiempo_entre_entrevistas", nullable = false)
    private Integer tiempoEntreEntrevistas; // En minutos: 15, 0, etc.

    @Column(name = "max_entrevistas_dia", nullable = false)
    private Integer maxEntrevistasDia; // Ej: 4

    @Column(name = "dias_disponibles", nullable = false, length = 255)
    private String diasDisponibles; // Comma-separated: "Lunes,Miércoles,Viernes"

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}
