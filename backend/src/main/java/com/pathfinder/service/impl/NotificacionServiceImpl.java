package com.pathfinder.service.impl;

import com.pathfinder.dto.response.NotificacionResponse;
import com.pathfinder.model.entity.Notificacion;
import com.pathfinder.repository.NotificacionRepository;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.service.NotificacionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificacionServiceImpl implements NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void crearNotificacion(String tipo, String mensaje, String correoDestino, Integer referenciaId) {
        var usuario = usuarioRepository.findByCorreo(correoDestino)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + correoDestino));

        Notificacion notificacion = new Notificacion();
        notificacion.setUsuario(usuario);
        notificacion.setTipo(tipo);
        notificacion.setMensaje(mensaje);
        notificacion.setReferenciaId(referenciaId);
        notificacion.setLeida(false);

        notificacion = notificacionRepository.save(notificacion);

        var response = mapToDTO(notificacion);
        int noLeidas = notificacionRepository.countByUsuario_CorreoAndLeidaFalse(correoDestino);

        try {
            messagingTemplate.convertAndSendToUser(
                    correoDestino,
                    "/queue/notificaciones",
                    new NotificacionWebSocketPayload(response, noLeidas)
            );
        } catch (Exception e) {
            log.warn("No se pudo enviar notificacion WebSocket a {}: {}", correoDestino, e.getMessage());
        }

        log.info("Notificacion creada para {}: {} - {}", correoDestino, tipo, mensaje);
    }

    @Override
    public List<NotificacionResponse> listarNotificaciones(String correo) {
        return notificacionRepository.findByUsuario_CorreoOrderByFechaCreacionDesc(correo)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificacionResponse> listarUltimasNotificaciones(String correo) {
        return notificacionRepository.findTop10ByUsuario_CorreoOrderByFechaCreacionDesc(correo)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public int contarNoLeidas(String correo) {
        return notificacionRepository.countByUsuario_CorreoAndLeidaFalse(correo);
    }

    @Override
    @Transactional
    public void marcarComoLeida(Integer idNotificacion, String correo) {
        notificacionRepository.findById(idNotificacion).ifPresent(n -> {
            if (n.getUsuario().getCorreo().equals(correo)) {
                n.setLeida(true);
                notificacionRepository.save(n);
            }
        });
    }

    @Override
    @Transactional
    public void marcarTodasComoLeidas(String correo) {
        notificacionRepository.marcarTodasComoLeidas(correo);
    }

    private NotificacionResponse mapToDTO(Notificacion n) {
        return NotificacionResponse.builder()
                .idNotificacion(n.getIdNotificacion())
                .tipo(n.getTipo())
                .mensaje(n.getMensaje())
                .referenciaId(n.getReferenciaId())
                .leida(n.getLeida())
                .fechaCreacion(n.getFechaCreacion())
                .build();
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class NotificacionWebSocketPayload {
        private NotificacionResponse notificacion;
        private int noLeidas;
    }
}
