package com.pathfinder.controller;

import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.EstadoEstudianteResponse;
import com.pathfinder.dto.response.UserResponse;
import com.pathfinder.service.PerfilEstudianteService;
import com.pathfinder.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService             userService;
    private final PerfilEstudianteService perfilEstudianteService;

    // GET /api/users/me  — datos básicos del usuario autenticado
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(
            @AuthenticationPrincipal UserDetails userDetails) {
        var usuario = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(UserResponse.from(usuario)));
    }

    // GET /api/users/me/status  — estado de avance del estudiante (HU-EST-03)
    @GetMapping("/me/status")
    public ResponseEntity<ApiResponse<EstadoEstudianteResponse>> getStatus(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            EstadoEstudianteResponse estado =
                    perfilEstudianteService.obtenerEstado(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Estado obtenido", estado));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error obteniendo el estado del estudiante"));
        }
    }
}