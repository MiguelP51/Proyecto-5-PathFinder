package com.pathfinder.model.entity;

import com.pathfinder.model.enums.EstadoEtapa;
import com.pathfinder.model.enums.NombreEtapa;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name = "progreso_estudiante",
        uniqueConstraints = @UniqueConstraint(columnNames = {"id_usuario", "nombre_etapa"})
)
public class ProgresoEstudiante extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_progreso")
    private Integer idProgreso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "nombre_etapa", nullable = false, length = 30)
    private NombreEtapa nombreEtapa;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_etapa", nullable = false, length = 20)
    private EstadoEtapa estadoEtapa;

    @Column(name = "fecha_completada")
    private LocalDateTime fechaCompletada;
}