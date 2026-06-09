package com.pathfinder.controller;

import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.SubAreaResponseDTO;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.service.ExplorationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/exploracion")
@RequiredArgsConstructor
public class ExplorationController {

    private final ExplorationService explorationService;
    private final UsuarioRepository usuarioRepository;

    // GET /api/exploracion/areas/{areaId}/subareas
    @GetMapping("/areas/{areaId}/subareas")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<SubAreaResponseDTO>>> getSubAreas(
            @PathVariable String areaId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Usuario usuario = usuarioRepository.findByCorreo(userDetails.getUsername())
                    .orElseThrow();
            List<SubAreaResponseDTO> result = explorationService
                    .getSubAreasByArea(areaId, usuario.getIdUsuario());
            return ResponseEntity.ok(ApiResponse.success("SubAreas obtenidas", result));
        } catch (Exception e) {
            log.error("Error obteniendo subareas: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener SubAreas"));
        }
    }

    // GET /api/exploracion/subareas/{idSubarea}
    @GetMapping("/subareas/{idSubarea}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<SubAreaResponseDTO>> getSubAreaDetalle(
            @PathVariable Integer idSubarea,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Usuario usuario = usuarioRepository.findByCorreo(userDetails.getUsername())
                    .orElseThrow();
            SubAreaResponseDTO result = explorationService
                    .getSubAreaDetalle(idSubarea, usuario.getIdUsuario());
            return ResponseEntity.ok(ApiResponse.success("SubArea obtenida", result));
        } catch (Exception e) {
            log.error("Error obteniendo detalle subarea: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener detalle de SubArea"));
        }
    }

    // POST /api/exploracion/subareas/{idSubarea}/visitar
    @PostMapping("/subareas/{idSubarea}/visitar")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Void>> registrarVisita(
            @PathVariable Integer idSubarea,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Usuario usuario = usuarioRepository.findByCorreo(userDetails.getUsername())
                    .orElseThrow();
            explorationService.registrarVisita(idSubarea, usuario.getIdUsuario());
            return ResponseEntity.ok(ApiResponse.success("Visita registrada", null));
        } catch (Exception e) {
            log.error("Error registrando visita: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al registrar visita"));
        }
    }
}