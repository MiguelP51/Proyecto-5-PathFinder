package com.pathfinder.controller;

import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.SkillPathActivoDTO;
import com.pathfinder.model.entity.SkillPath;
import com.pathfinder.repository.SkillPathRepository;
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
@RequestMapping("/api/skillpaths")
@RequiredArgsConstructor
public class SkillPathController {

    private final SkillPathRepository skillPathRepository;

    // GET /api/skillpaths/activos → SkillPaths EN_PROGRESO del estudiante
    @GetMapping("/activos")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<SkillPathActivoDTO>>> getActivos(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<SkillPath> skillPaths = skillPathRepository
                    .findByUsuario_CorreoAndEstado(userDetails.getUsername(), "EN_PROGRESO");

            List<SkillPathActivoDTO> dtos = skillPaths.stream()
                    .map(sp -> SkillPathActivoDTO.builder()
                            .idSkillPath(sp.getIdSkillPath())
                            .titulo(sp.getTitulo())
                            .plataforma(sp.getPlataforma())
                            .progreso(sp.getProgreso())
                            .estado(sp.getEstado())
                            .xp(sp.getXp())
                            .build())
                    .toList();

            return ResponseEntity.ok(ApiResponse.success("SkillPaths activos obtenidos", dtos));
        } catch (Exception e) {
            log.error("Error obteniendo skillpaths activos: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener SkillPaths activos"));
        }
    }

    // GET /api/skillpaths → Todos los SkillPaths del estudiante
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<SkillPathActivoDTO>>> getTodos(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<SkillPath> skillPaths = skillPathRepository
                    .findByUsuario_Correo(userDetails.getUsername());

            List<SkillPathActivoDTO> dtos = skillPaths.stream()
                    .map(sp -> SkillPathActivoDTO.builder()
                            .idSkillPath(sp.getIdSkillPath())
                            .titulo(sp.getTitulo())
                            .plataforma(sp.getPlataforma())
                            .progreso(sp.getProgreso())
                            .estado(sp.getEstado())
                            .xp(sp.getXp())
                            .build())
                    .toList();

            return ResponseEntity.ok(ApiResponse.success("SkillPaths obtenidos", dtos));
        } catch (Exception e) {
            log.error("Error obteniendo skillpaths: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener SkillPaths"));
        }
    }
}
