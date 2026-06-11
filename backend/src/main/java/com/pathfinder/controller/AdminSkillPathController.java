package com.pathfinder.controller;

import com.pathfinder.dto.admin.curso.CursoExternoResponseDTO;
import com.pathfinder.dto.admin.skillpath.UpdateAdminSkillPathRequestDTO;
import com.pathfinder.dto.admin.skillpath.UpdateAdminSkillPathStatusRequestDTO;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.model.enums.NivelCurso;
import com.pathfinder.service.AdminSkillPathService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/skillpaths")
@RequiredArgsConstructor
public class AdminSkillPathController {

    private final AdminSkillPathService adminSkillPathService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CursoExternoResponseDTO>>> listarSkillPaths(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer idHabilidad,
            @RequestParam(required = false) NivelCurso nivel
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "SkillPaths obtenidos correctamente",
                        adminSkillPathService.buscarSkillPaths(search, idHabilidad, nivel)
                )
        );
    }

    @PutMapping("/{idCurso}")
    public ResponseEntity<ApiResponse<CursoExternoResponseDTO>> actualizarSkillPath(
            @PathVariable Integer idCurso,
            @Valid @RequestBody UpdateAdminSkillPathRequestDTO request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "SkillPath actualizado correctamente",
                        adminSkillPathService.actualizarSkillPath(idCurso, request)
                )
        );
    }

    @PatchMapping("/{idCurso}/estado")
    public ResponseEntity<ApiResponse<CursoExternoResponseDTO>> actualizarEstadoSkillPath(
            @PathVariable Integer idCurso,
            @Valid @RequestBody UpdateAdminSkillPathStatusRequestDTO request
    ) {
        String mensaje = Boolean.TRUE.equals(request.getActivo())
                ? "SkillPath activado correctamente"
                : "SkillPath desactivado correctamente";

        return ResponseEntity.ok(
                ApiResponse.success(
                        mensaje,
                        adminSkillPathService.actualizarEstadoSkillPath(idCurso, request.getActivo())
                )
        );
    }

    @DeleteMapping("/{idCurso}")
    public ResponseEntity<ApiResponse<Void>> eliminarSkillPath(
            @PathVariable Integer idCurso
    ) {
        adminSkillPathService.eliminarSkillPath(idCurso);

        return ResponseEntity.ok(
                ApiResponse.success("SkillPath eliminado correctamente", null)
        );
    }
}