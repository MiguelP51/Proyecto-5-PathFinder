package com.pathfinder.controller;

import com.pathfinder.dto.admin.manage_skillpath.*;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.service.AdminManageSkillPathService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/manage-skillpaths")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminManageSkillPathController {

    private final AdminManageSkillPathService adminManageSkillPathService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminManageSkillPathResponseDTO>>> listar(
            @RequestParam(required = false, defaultValue = "TODOS") String tipo) {
        return ResponseEntity.ok(
                ApiResponse.success("SkillPaths obtenidos correctamente", adminManageSkillPathService.listarSkillPaths(tipo))
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminManageSkillPathResponseDTO>> crear(
            @Valid @RequestBody CreateAdminManageSkillPathRequestDTO request) {
        return ResponseEntity.ok(
                ApiResponse.success("SkillPath creado correctamente", adminManageSkillPathService.crearSkillPathGlobal(request))
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminManageSkillPathResponseDTO>> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateAdminManageSkillPathRequestDTO request) {
        return ResponseEntity.ok(
                ApiResponse.success("SkillPath actualizado", adminManageSkillPathService.actualizarSkillPath(id, request))
        );
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<AdminManageSkillPathResponseDTO>> actualizarEstado(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateAdminManageSkillPathStatusRequestDTO request) {
        return ResponseEntity.ok(
                ApiResponse.success("Estado actualizado", adminManageSkillPathService.cambiarEstado(id, request))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Integer id) {
        adminManageSkillPathService.eliminarSkillPath(id);
        return ResponseEntity.ok(ApiResponse.success("SkillPath eliminado", null));
    }

    @PostMapping(value = "/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<BulkAdminManageSkillPathResultDTO>> importarCsv(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(
                ApiResponse.success("Archivo procesado", adminManageSkillPathService.importarCsv(file))
        );
    }
}
