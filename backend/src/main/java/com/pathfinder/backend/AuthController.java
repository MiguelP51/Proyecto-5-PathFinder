package com.pathfinder.backend;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody LoginRequest request) {

        if ("admin@pathfinder.com".equals(request.getEmail()) &&
            "123456".equals(request.getPassword())) {

            Map<String, Object> user = Map.of(
                    "id", 1,
                    "name", "Usuario de prueba",
                    "email", request.getEmail(),
                    "role", "ADMIN"
            );

            Map<String, Object> data = Map.of(
                    "token", "mock-token-123",
                    "user", user
            );

            return ApiResponse.success("Autenticación exitosa", data);
        }

        return ApiResponse.error(
                "Credenciales inválidas",
                Map.of("credentials", "El email o la contraseña son incorrectos")
        );
    }
}