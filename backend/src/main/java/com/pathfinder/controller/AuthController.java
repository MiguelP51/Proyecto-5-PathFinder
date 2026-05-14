package com.pathfinder.controller;

import com.pathfinder.dto.auth.LoginRequestDTO;
import com.pathfinder.dto.auth.LoginResponseDTO;
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
    public ResponseEntity<ApiResponse<LoginResponseDTO>> login(
            @RequestBody LoginRequestDTO request) {

        try {
            LoginResponseDTO response = authService.login(request);
            return ResponseEntity.ok(
                    ApiResponse.success("Login exitoso", response)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error en login: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error procesando el login"));
        }
    }
}