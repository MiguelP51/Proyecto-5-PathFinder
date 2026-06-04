package com.pathfinder.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AuditoriaBase {

    @CreatedDate
    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;

    @CreatedBy
    @Column(name = "usuario_registro", updatable = false)
    private Integer usuarioRegistro;

    @LastModifiedDate
    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;

    @LastModifiedBy
    @Column(name = "usuario_modificacion")
    private Integer usuarioModificacion;

    @Column(name = "activo")
    private Boolean activo;

    @PrePersist
    public void prePersist() {
        if (this.activo == null) {
            this.activo = true;
        }
    }
}