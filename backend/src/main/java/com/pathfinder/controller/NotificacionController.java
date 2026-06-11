package com.pathfinder.controller;

import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.NotificacionResponse;
import com.pathfinder.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificacionResponse>>> listar(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<NotificacionResponse> lista = notificacionService.listarUltimasNotificaciones(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Notificaciones obtenidas", lista));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> count(
            @AuthenticationPrincipal UserDetails userDetails) {
        int count = notificacionService.contarNoLeidas(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Conteo obtenido", Map.of("count", count)));
    }

    @PutMapping("/{id}/leer")
    public ResponseEntity<ApiResponse<Void>> marcarLeida(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        notificacionService.marcarComoLeida(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Notificación marcada como leída", null));
    }

    @PutMapping("/leer-todas")
    public ResponseEntity<ApiResponse<Void>> marcarTodasLeidas(
            @AuthenticationPrincipal UserDetails userDetails) {
        notificacionService.marcarTodasComoLeidas(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Todas las notificaciones marcadas como leídas", null));
    }
}
