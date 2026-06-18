package com.pathfinder.controller;

import com.pathfinder.dto.admin.progress.AdminStudentProgressSummaryDTO;
import com.pathfinder.dto.admin.progress.AdminStudentSkillPathProgressDTO;
import com.pathfinder.dto.admin.progress.AdminStudentSubAreaProgressDTO;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.service.AdminStudentProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/estudiantes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentProgressController {

    private final AdminStudentProgressService adminStudentProgressService;

    @GetMapping("/progreso")
    public ResponseEntity<ApiResponse<List<AdminStudentProgressSummaryDTO>>> listarResumenEstudiantes() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Resumen de progreso de estudiantes obtenido",
                        adminStudentProgressService.listarResumenEstudiantes()
                )
        );
    }

    @GetMapping("/{idUsuario}/progreso/skillpaths")
    public ResponseEntity<ApiResponse<List<AdminStudentSkillPathProgressDTO>>> listarSkillPathsEstudiante(
            @PathVariable Integer idUsuario
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Progreso de SkillPaths del estudiante obtenido",
                        adminStudentProgressService.listarSkillPathsEstudiante(idUsuario)
                )
        );
    }

    @GetMapping("/{idUsuario}/progreso/subareas")
    public ResponseEntity<ApiResponse<List<AdminStudentSubAreaProgressDTO>>> listarSubAreasEstudiante(
            @PathVariable Integer idUsuario
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Progreso de subareas del estudiante obtenido",
                        adminStudentProgressService.listarSubAreasEstudiante(idUsuario)
                )
        );
    }
}
