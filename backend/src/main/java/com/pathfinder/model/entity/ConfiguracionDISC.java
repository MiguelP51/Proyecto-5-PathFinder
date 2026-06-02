package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "configuracion_disc")
public class ConfiguracionDISC extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_configuracion_disc")
    private Integer idConfiguracionDisc;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "tiempo_limite_minutos")
    private Integer tiempoLimiteMinutos;

    @Column(name = "numero_preguntas")
    private Integer numeroPreguntas;

    @Column(name = "tiempo_reintento_dias")
    private Integer tiempoReintentoDias;

    @Column(name = "puntuacion_minima_porcentaje")
    private Integer puntuacionMinimaPorcentaje;

    @Column(name = "vigencia_resultado_dias")
    private Integer vigenciaResultadoDias;

    @Column(name = "fecha_inicio_vigencia")
    private LocalDateTime fechaInicioVigencia;
}