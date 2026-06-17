package com.pathfinder.audit.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Evento interno para transportar los datos de auditoría de forma desacoplada.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditEvent {
    private String modulo;
    private String accion;
    private String usuarioCorreo;
    private Integer usuarioId;
    private String rol;
    private String ipOrigen;
    private String detalles;
    private String resultado;
    private String mensajeError;
    private LocalDateTime fechaEvento;
}
