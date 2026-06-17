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

    @Column(name = "nombre_archivo", length = 255)
    private String nombreArchivo;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "tamanio_bytes")
    private Long tamanioBytes;

    @Column(name = "ruta_archivo", length = 500)
    private String rutaArchivo;

    @Column(name = "metodo_validacion", length = 30)
    private String metodoValidacion;

    @Column(name = "url_verificacion", length = 500)
    private String urlVerificacion;

    @Column(name = "codigo_verificacion", length = 120)
    private String codigoVerificacion;

    @Column(name = "plataforma_emisora", length = 30)
    private String plataformaEmisora;

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