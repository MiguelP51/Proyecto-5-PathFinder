package com.pathfinder.controller;

import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.InsigniaDTO;
import com.pathfinder.model.entity.Insignia;
import com.pathfinder.repository.InsigniaRepository;
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
@RequestMapping("/api/insignias")
@RequiredArgsConstructor
public class InsigniaController {

    private final InsigniaRepository insigniaRepository;

    // GET /api/insignias → Todas las insignias del estudiante
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<InsigniaDTO>>> getInsignias(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<Insignia> insignias = insigniaRepository
                    .findByUsuario_CorreoOrderByFechaRegistroDesc(userDetails.getUsername());

            List<InsigniaDTO> dtos = insignias.stream()
                    .map(ins -> InsigniaDTO.builder()
                            .idInsignia(ins.getIdInsignia())
                            .nombre(ins.getNombre())
                            .descripcion(ins.getDescripcion())
                            .emoji(ins.getEmoji())
                            .colorFondo(ins.getColorFondo())
                            .fechaObtenida(ins.getFechaObtenida())
                            .build())
                    .toList();

            return ResponseEntity.ok(ApiResponse.success("Insignias obtenidas", dtos));
        } catch (Exception e) {
            log.error("Error obteniendo insignias: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener insignias"));
        }
    }
}
