package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name = "usuario_skill_path",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_usuario_skill_path",
                        columnNames = {"id_usuario", "id_skill_path"}
                )
        }
)
public class UsuarioSkillPath {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario_skill_path")
    private Integer idUsuarioSkillPath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_skill_path", nullable = false)
    private SkillPath skillPath;

    @Column(name = "estado", nullable = false, length = 30)
    private String estado = "DISPONIBLE";

    @Column(name = "progreso", nullable = false)
    private Integer progreso = 0;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_completado")
    private LocalDateTime fechaCompletado;

    @Column(name = "fecha_validacion")
    private LocalDateTime fechaValidacion;

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

        if (estado == null) {
            estado = "DISPONIBLE";
        }

        if (progreso == null) {
            progreso = 0;
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