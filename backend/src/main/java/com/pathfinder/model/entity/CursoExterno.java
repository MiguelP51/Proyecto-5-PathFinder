package com.pathfinder.model.entity;

import com.pathfinder.model.enums.EstadoEnlace;
import com.pathfinder.model.enums.NivelCurso;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "curso_externo")
public class CursoExterno extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_curso")
    private Integer idCurso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private ProveedorExterno proveedor;

    @Column(name = "titulo", nullable = false, length = 250)
    private String titulo;

    @Column(name = "url", nullable = false, unique = true, columnDefinition = "TEXT")
    private String url;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel", length = 30)
    private NivelCurso nivel;

    @Column(name = "duracion", length = 100)
    private String duracion;

    @Column(name = "xp", nullable = false)
    private Integer xp = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_enlace", nullable = false, length = 30)
    private EstadoEnlace estadoEnlace;

    @Column(name = "es_gratuito", nullable = false)
    private Boolean esGratuito = true;

    @Column(name = "ultima_verificacion")
    private LocalDateTime ultimaVerificacion;
}
