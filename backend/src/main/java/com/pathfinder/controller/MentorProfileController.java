package com.pathfinder.controller;

import com.pathfinder.dto.request.MentorProfileRequest;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.MentorProfileResponse;
import com.pathfinder.service.MentorProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/mentor/profile")
@RequiredArgsConstructor
public class MentorProfileController {

    private final MentorProfileService mentorProfileService;

    @GetMapping
    public ResponseEntity<ApiResponse<MentorProfileResponse>> obtenerPerfil(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            MentorProfileResponse perfil =
                    mentorProfileService.obtenerPerfil(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Perfil del mentor obtenido correctamente", perfil));
        } catch (Exception e) {
            log.error("Error obteniendo perfil del mentor: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error obteniendo el perfil del mentor"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MentorProfileResponse>> obtenerPerfilPorId(
            @PathVariable Integer id) {
        try {
            MentorProfileResponse perfil =
                    mentorProfileService.obtenerPerfilPorId(id);
            return ResponseEntity.ok(ApiResponse.success("Perfil del mentor obtenido correctamente", perfil));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error obteniendo perfil del mentor por ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error obteniendo el perfil del mentor"));
        }
    }

    @PutMapping
    public ResponseEntity<ApiResponse<MentorProfileResponse>> guardarPerfil(
            @Valid @RequestBody MentorProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            MentorProfileResponse perfil =
                    mentorProfileService.guardarPerfil(userDetails.getUsername(), request);
            return ResponseEntity.ok(ApiResponse.success("Perfil del mentor guardado correctamente", perfil));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error guardando perfil del mentor: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error guardando el perfil del mentor"));
        }
    }
}
