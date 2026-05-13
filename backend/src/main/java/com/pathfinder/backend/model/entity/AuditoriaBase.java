package com.pathfinder.backend.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@MappedSuperclass
public abstract class AuditoriaBase {

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @Column(name = "usuario_registro")
    private Integer usuarioRegistro;

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;

    @Column(name = "usuario_modificacion")
    private Integer usuarioModificacion;

    @Column(name = "activo")
    private Boolean activo;

    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDateTime.now();
        }

        if (this.activo == null) {
            this.activo = true;
        }
    }
}