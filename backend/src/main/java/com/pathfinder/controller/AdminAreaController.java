package com.pathfinder.controller;

import com.pathfinder.dto.admin.area.AreaRequestDTO;
import com.pathfinder.dto.admin.area.AreaResponseDTO;
import com.pathfinder.dto.admin.subarea.SubAreaRequestDTO;
import com.pathfinder.dto.admin.subarea.SubAreaAdminResponseDTO;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.service.AdminAreaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAreaController {

    private final AdminAreaService adminAreaService;

    // --- ENDPOINTS DE ÁREAS ---

    @GetMapping("/areas")
    public ResponseEntity<ApiResponse<List<AreaResponseDTO>>> listarAreas(
            @RequestParam(required = false, defaultValue = "false") Boolean soloActivos) {
        List<AreaResponseDTO> data = adminAreaService.listarAreas(soloActivos);
        return ResponseEntity.ok(ApiResponse.success("Áreas obtenidas correctamente", data));
    }

    @GetMapping("/areas/{idArea}")
    public ResponseEntity<ApiResponse<AreaResponseDTO>> obtenerArea(@PathVariable String idArea) {
        AreaResponseDTO data = adminAreaService.obtenerAreaPorId(idArea);
        return ResponseEntity.ok(ApiResponse.success("Área obtenida correctamente", data));
    }

    @PostMapping("/areas")
    public ResponseEntity<ApiResponse<AreaResponseDTO>> crearArea(
            @Valid @RequestBody AreaRequestDTO request) {
        AreaResponseDTO data = adminAreaService.crearArea(request);
        return ResponseEntity.ok(ApiResponse.success("Área creada correctamente", data));
    }

    @PutMapping("/areas/{idArea}")
    public ResponseEntity<ApiResponse<AreaResponseDTO>> actualizarArea(
            @PathVariable String idArea,
            @Valid @RequestBody AreaRequestDTO request) {
        AreaResponseDTO data = adminAreaService.actualizarArea(idArea, request);
        return ResponseEntity.ok(ApiResponse.success("Área actualizada correctamente", data));
    }

    @PatchMapping("/areas/{idArea}/estado")
    public ResponseEntity<ApiResponse<AreaResponseDTO>> cambiarEstadoArea(
            @PathVariable String idArea,
            @RequestParam Boolean activo) {
        AreaResponseDTO data = adminAreaService.cambiarEstadoArea(idArea, activo);
        return ResponseEntity.ok(ApiResponse.success("Estado del área actualizado correctamente", data));
    }

    @PostMapping(value = "/areas/{idArea}/imagen", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<String>> subirImagen(
            @PathVariable String idArea,
            @RequestParam("file") MultipartFile file) {
        String s3Key = adminAreaService.subirImagenArea(idArea, file);
        return ResponseEntity.ok(ApiResponse.success("Imagen subida correctamente", s3Key));
    }

    // --- ENDPOINTS DE SUBÁREAS ---

    @GetMapping("/subareas")
    public ResponseEntity<ApiResponse<List<SubAreaAdminResponseDTO>>> listarSubAreas(
            @RequestParam(required = false) String areaId,
            @RequestParam(required = false, defaultValue = "false") Boolean soloActivos) {
        List<SubAreaAdminResponseDTO> data = adminAreaService.listarSubAreas(areaId, soloActivos);
        return ResponseEntity.ok(ApiResponse.success("Subáreas obtenidas correctamente", data));
    }

    @GetMapping("/subareas/{idSubarea}")
    public ResponseEntity<ApiResponse<SubAreaAdminResponseDTO>> obtenerSubArea(@PathVariable Integer idSubarea) {
        SubAreaAdminResponseDTO data = adminAreaService.obtenerSubAreaPorId(idSubarea);
        return ResponseEntity.ok(ApiResponse.success("Subárea obtenida correctamente", data));
    }

    @PostMapping("/subareas")
    public ResponseEntity<ApiResponse<SubAreaAdminResponseDTO>> crearSubArea(
            @Valid @RequestBody SubAreaRequestDTO request) {
        SubAreaAdminResponseDTO data = adminAreaService.crearSubArea(request);
        return ResponseEntity.ok(ApiResponse.success("Subárea creada correctamente", data));
    }

    @PutMapping("/subareas/{idSubarea}")
    public ResponseEntity<ApiResponse<SubAreaAdminResponseDTO>> actualizarSubArea(
            @PathVariable Integer idSubarea,
            @Valid @RequestBody SubAreaRequestDTO request) {
        SubAreaAdminResponseDTO data = adminAreaService.actualizarSubArea(idSubarea, request);
        return ResponseEntity.ok(ApiResponse.success("Subárea actualizada correctamente", data));
    }

    @PatchMapping("/subareas/{idSubarea}/estado")
    public ResponseEntity<ApiResponse<SubAreaAdminResponseDTO>> cambiarEstadoSubArea(
            @PathVariable Integer idSubarea,
            @RequestParam Boolean activo) {
        SubAreaAdminResponseDTO data = adminAreaService.cambiarEstadoSubArea(idSubarea, activo);
        return ResponseEntity.ok(ApiResponse.success("Estado de la subárea actualizado correctamente", data));
    }
}
