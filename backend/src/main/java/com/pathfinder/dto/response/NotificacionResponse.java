package com.pathfinder.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificacionResponse {
    private Integer idNotificacion;
    private String tipo;
    private String mensaje;
    private Integer referenciaId;
    private boolean leida;
    private LocalDateTime fechaCreacion;
}
