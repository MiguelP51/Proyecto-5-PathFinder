package com.pathfinder.controller;

import com.pathfinder.dto.request.GuardarPerfilRequest;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.EstadoEstudianteResponse;
import com.pathfinder.dto.response.PerfilEstudianteResponse;
import com.pathfinder.service.PerfilEstudianteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final PerfilEstudianteService perfilEstudianteService;

    // GET /api/profile — perfil completo para revisión (HU-EST-08)
    @GetMapping
    public ResponseEntity<ApiResponse<PerfilEstudianteResponse>> obtenerPerfil(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            PerfilEstudianteResponse perfil =
                    perfilEstudianteService.obtenerPerfil(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Perfil obtenido correctamente", perfil));
        } catch (Exception e) {
            log.error("Error obteniendo perfil: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error obteniendo el perfil"));
        }
    }

    // PUT /api/profile — guardar perfil (HU-EST-04 al 08)
    @PutMapping
    public ResponseEntity<ApiResponse<PerfilEstudianteResponse>> guardarPerfil(
            @Valid @RequestBody GuardarPerfilRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            PerfilEstudianteResponse perfil =
                    perfilEstudianteService.guardarPerfil(userDetails.getUsername(), request);
            return ResponseEntity.ok(ApiResponse.success("Perfil guardado correctamente", perfil));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error guardando perfil: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error guardando el perfil"));
        }
    }

    // POST /api/profile/confirm — confirmar perfil consolidado (HU-EST-09)
    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<EstadoEstudianteResponse>> confirmarPerfil(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            EstadoEstudianteResponse estado =
                    perfilEstudianteService.confirmarPerfil(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Perfil confirmado correctamente", estado));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error confirmando perfil: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error confirmando el perfil"));
        }
    }
}