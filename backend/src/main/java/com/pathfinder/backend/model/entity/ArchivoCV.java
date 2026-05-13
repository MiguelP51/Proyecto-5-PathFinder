package com.pathfinder.backend.model.entity;

import com.pathfinder.backend.model.enums.EstadoValidacionArchivo;
import com.pathfinder.backend.model.enums.FormatoArchivo;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "archivo_cv")
public class ArchivoCV extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_archivo_cv")
    private Integer idArchivoCv;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_perfil_cv", nullable = false)
    private PerfilCV perfilCv;

    @Column(name = "nombre_archivo", length = 150)
    private String nombreArchivo;

    @Enumerated(EnumType.STRING)
    @Column(name = "formato_archivo", length = 20)
    private FormatoArchivo formatoArchivo;

    @Column(name = "ruta_archivo", length = 255)
    private String rutaArchivo;

    @Column(name = "tamano_archivo", precision = 10, scale = 2)
    private BigDecimal tamanoArchivo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_validacion", length = 30)
    private EstadoValidacionArchivo estadoValidacion;

    @Column(name = "fecha_carga")
    private LocalDateTime fechaCarga;
}