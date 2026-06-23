package com.pathfinder.dto.admin.audit;

import com.pathfinder.audit.model.BitacoraAuditoria;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * DTO para enviar la información de la bitácora de auditoría al frontend.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BitacoraAuditoriaResponseDTO {
    private Long idAuditoria;
    private LocalDateTime fechaEvento;
    private String usuarioCorreo;
    private String accion;

    /**
     * Mapea un objeto entidad a un DTO.
     */
    public static BitacoraAuditoriaResponseDTO from(BitacoraAuditoria entity) {
        if (entity == null) {
            return null;
        }
        return BitacoraAuditoriaResponseDTO.builder()
                .idAuditoria(entity.getIdAuditoria())
                .fechaEvento(entity.getFechaEvento())
                .usuarioCorreo(entity.getUsuarioCorreo())
                .accion(entity.getAccion())
                .build();
    }
}
