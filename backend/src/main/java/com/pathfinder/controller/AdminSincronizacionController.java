package com.pathfinder.controller;

import com.pathfinder.dto.admin.curso.CsvImportResultDTO;
import com.pathfinder.dto.admin.curso.CursoExternoResponseDTO;
import com.pathfinder.dto.admin.curso.ProveedorResponseDTO;
import com.pathfinder.dto.admin.curso.UpdateCursoRequestDTO;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.model.entity.CursoExterno;
import com.pathfinder.service.SincronizacionService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.pathfinder.model.entity.ProveedorExterno;

import java.util.List;

import com.pathfinder.dto.admin.curso.CreateProveedorRequestDTO;

@RestController
@RequestMapping("/api/admin/sincronizacion")
@RequiredArgsConstructor
public class AdminSincronizacionController {

    private final SincronizacionService sincronizacionService;

    @PostMapping("/proveedores")
    public ResponseEntity<ApiResponse<ProveedorResponseDTO>> crearProveedor(@Valid @RequestBody CreateProveedorRequestDTO request) {
        ProveedorExterno proveedor = sincronizacionService.crearProveedor(request);
        ProveedorResponseDTO response = ProveedorResponseDTO.from(proveedor, 0);
        return ResponseEntity.ok(ApiResponse.success("Proveedor creado exitosamente", response));
    }

    @GetMapping("/proveedores")
    public ResponseEntity<ApiResponse<List<ProveedorResponseDTO>>> listarProveedores() {
        List<ProveedorResponseDTO> response = sincronizacionService.listarProveedores().stream()
                .map(p -> ProveedorResponseDTO.from(
                        p, 
                        sincronizacionService.contarCursosPorProveedor(p.getIdProveedor())
                ))
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Proveedores obtenidos", response));
    }

    @GetMapping("/proveedores/{idProveedor}/cursos")
    public ResponseEntity<ApiResponse<List<CursoExternoResponseDTO>>> listarCursos(
            @PathVariable Integer idProveedor) {
        List<CursoExternoResponseDTO> response = sincronizacionService.listarCursos(idProveedor).stream()
                .map(CursoExternoResponseDTO::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Cursos obtenidos", response));
    }

    @PutMapping("/cursos/{idCurso}")
    public ResponseEntity<ApiResponse<CursoExternoResponseDTO>> actualizarCurso(
            @PathVariable Integer idCurso,
            @Valid @RequestBody UpdateCursoRequestDTO request) {
        try {
            CursoExterno curso = sincronizacionService.actualizarCurso(idCurso, request);
            return ResponseEntity.ok(ApiResponse.success("Curso actualizado", CursoExternoResponseDTO.from(curso)));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/proveedores/{idProveedor}/sync")
    public ResponseEntity<ApiResponse<String>> sincronizarApi(@PathVariable Integer idProveedor) {
        try {
            sincronizacionService.sincronizarApi(idProveedor);
            return ResponseEntity.ok(ApiResponse.success("Sincronización en proceso", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/proveedores/{idProveedor}/csv")
    public ResponseEntity<ApiResponse<CsvImportResultDTO>> importarCsv(
            @PathVariable Integer idProveedor,
            @RequestParam("file") MultipartFile file) {
        try {
            CsvImportResultDTO result = sincronizacionService.importarCsv(idProveedor, file);
            return ResponseEntity.ok(ApiResponse.success("Archivo procesado", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
