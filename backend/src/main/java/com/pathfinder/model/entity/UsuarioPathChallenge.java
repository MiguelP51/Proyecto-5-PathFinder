package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name = "usuario_path_challenge",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_usuario_path_challenge",
                        columnNames = {"id_usuario", "id_path_challenge"}
                )
        }
)
public class UsuarioPathChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario_path_challenge")
    private Integer idUsuarioPathChallenge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_path_challenge", nullable = false)
    private PathChallenge pathChallenge;

    @Column(name = "estado", nullable = false, length = 30)
    private String estado = "EN_PROGRESO";

    @Column(name = "progreso_porcentaje", nullable = false)
    private Integer progresoPorcentaje = 0;

    @Column(name = "entrega_texto", columnDefinition = "TEXT")
    private String entregaTexto;

    @Column(name = "archivo_url", length = 500)
    private String archivoUrl;

    @Column(name = "archivo_nombre", length = 255)
    private String archivoNombre;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_ultimo_avance")
    private LocalDateTime fechaUltimoAvance;

    @Column(name = "fecha_finalizacion")
    private LocalDateTime fechaFinalizacion;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;

    @PrePersist
    public void prePersist() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }

        if (fechaInicio == null) {
            fechaInicio = LocalDateTime.now();
        }

        if (fechaUltimoAvance == null) {
            fechaUltimoAvance = LocalDateTime.now();
        }

        if (estado == null) {
            estado = "EN_PROGRESO";
        }

        if (progresoPorcentaje == null) {
            progresoPorcentaje = 0;
        }
    }

    @PreUpdate
    public void preUpdate() {
        fechaModificacion = LocalDateTime.now();
        fechaUltimoAvance = LocalDateTime.now();
    }
}