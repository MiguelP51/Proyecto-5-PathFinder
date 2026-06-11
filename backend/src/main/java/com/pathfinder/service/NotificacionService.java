package com.pathfinder.service;

import com.pathfinder.dto.response.NotificacionResponse;

import java.util.List;

public interface NotificacionService {

    void crearNotificacion(String tipo, String mensaje, String correoDestino, Integer referenciaId);

    List<NotificacionResponse> listarNotificaciones(String correo);

    List<NotificacionResponse> listarUltimasNotificaciones(String correo);

    int contarNoLeidas(String correo);

    void marcarComoLeida(Integer idNotificacion, String correo);

    void marcarTodasComoLeidas(String correo);
}
