package com.pathfinder.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "evidencia_skill_path")
public class EvidenciaSkillPath {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evidencia_skill_path")
    private Integer idEvidenciaSkillPath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_skill_path", nullable = false)
    private UsuarioSkillPath usuarioSkillPath;

    @Column(name = "nombre_archivo", nullable = false, length = 255)
    private String nombreArchivo;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "tamanio_bytes", nullable = false)
    private Long tamanioBytes;

    @Column(name = "ruta_archivo", nullable = false, length = 500)
    private String rutaArchivo;

    @Column(name = "estado_validacion", nullable = false, length = 30)
    private String estadoValidacion = "PENDIENTE";

    @Column(name = "comentario_revision", columnDefinition = "TEXT")
    private String comentarioRevision;

    @Column(name = "fecha_subida", nullable = false)
    private LocalDateTime fechaSubida;

    @Column(name = "fecha_revision")
    private LocalDateTime fechaRevision;

    @PrePersist
    public void prePersist() {
        if (fechaSubida == null) {
            fechaSubida = LocalDateTime.now();
        }

        if (estadoValidacion == null) {
            estadoValidacion = "PENDIENTE";
        }
    }
}