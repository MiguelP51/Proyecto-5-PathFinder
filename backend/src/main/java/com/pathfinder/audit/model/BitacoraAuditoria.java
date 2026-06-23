package com.pathfinder.audit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entidad que representa la tabla de bitácora de auditoría independiente.
 */
@Entity
@Table(name = "bitacora_auditoria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BitacoraAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria")
    private Long idAuditoria;

    @Column(name = "fecha_evento", nullable = false)
    private LocalDateTime fechaEvento;

    @Column(name = "usuario_id")
    private Integer usuarioId;

    @Column(name = "usuario_correo", length = 150)
    private String usuarioCorreo;

    @Column(name = "rol", length = 30)
    private String rol;

    @Column(name = "modulo", length = 50)
    private String modulo;

    @Column(name = "accion", nullable = false, length = 100)
    private String accion;

    @Column(name = "ip_origen", length = 45)
    private String ipOrigen;

    @Column(name = "detalles", columnDefinition = "TEXT")
    private String detalles;

    @Column(name = "resultado", length = 20)
    private String resultado;

    @Column(name = "mensaje_error", columnDefinition = "TEXT")
    private String mensajeError;
}
