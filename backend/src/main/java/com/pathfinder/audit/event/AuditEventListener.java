package com.pathfinder.audit.event;

import com.pathfinder.audit.model.BitacoraAuditoria;
import com.pathfinder.audit.repository.BitacoraAuditoriaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Escuchador de eventos de auditoría para realizar la persistencia asíncrona.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuditEventListener {

    private final BitacoraAuditoriaRepository auditoriaRepository;

    @Async("auditTaskExecutor")
    @EventListener
    public void procesarEventoAuditoria(AuditEvent event) {
        try {
            BitacoraAuditoria entity = BitacoraAuditoria.builder()
                    .fechaEvento(event.getFechaEvento())
                    .usuarioCorreo(event.getUsuarioCorreo())
                    .accion(event.getAccion())
                    .build();

            auditoriaRepository.save(entity);

            log.info("AUDIT_LOG | Modulo: {} | Accion: {} | Usuario: {} | IP: {} | Resultado: {}",
                    event.getModulo(), event.getAccion(), event.getUsuarioCorreo(), event.getIpOrigen(), event.getResultado());
        } catch (Exception e) {
            // Un fallo en la persistencia de auditoría jamás debe interrumpir el flujo principal de negocio.
            log.error("CRITICAL: Error al intentar persistir registro de auditoría en la Base de Datos: {}", e.getMessage(), e);
        }
    }
}
