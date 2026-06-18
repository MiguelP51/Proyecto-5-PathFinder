package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name = "usuario_path_challenge_task",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_usuario_path_challenge_task",
                        columnNames = {"id_usuario_path_challenge", "id_path_challenge_task"}
                )
        }
)
public class UsuarioPathChallengeTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario_path_challenge_task")
    private Integer idUsuarioPathChallengeTask;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_path_challenge", nullable = false)
    private UsuarioPathChallenge usuarioPathChallenge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_path_challenge_task", nullable = false)
    private PathChallengeTask pathChallengeTask;

    @Column(name = "completada", nullable = false)
    private Boolean completada = false;

    @Column(name = "fecha_completada")
    private LocalDateTime fechaCompletada;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @PrePersist
    public void prePersist() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }

        if (completada == null) {
            completada = false;
        }

        if (activo == null) {
            activo = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        fechaModificacion = LocalDateTime.now();
    }
}