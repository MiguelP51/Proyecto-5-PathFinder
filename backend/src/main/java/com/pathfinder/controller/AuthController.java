package com.pathfinder.controller;

import com.pathfinder.dto.auth.LoginRequestDTO;
import com.pathfinder.dto.auth.UsuarioAuthResponseDTO;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UsuarioAuthResponseDTO>> login(
            @RequestBody LoginRequestDTO request) {

        try {
            UsuarioAuthResponseDTO response = authService.login(request);

            String mensaje = response.isNuevoUsuario()
                    ? "Usuario registrado parcialmente. Debe completar su perfil"
                    : "Usuario autenticado correctamente";

            return ResponseEntity.ok(ApiResponse.success(mensaje, response));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error procesando login/registro: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error procesando el login/registro"));
        }
    }
}