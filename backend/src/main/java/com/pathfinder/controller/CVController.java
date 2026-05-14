package com.pathfinder.controller;

import com.pathfinder.dto.cv.CVExtractadoDTO;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.service.CVService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/cv")
@RequiredArgsConstructor
public class CVController {

    private final CVService cvService;


    @PostMapping(value = "/extract", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CVExtractadoDTO>> extraerCV(
            @RequestParam("archivo") MultipartFile archivo) {

        if (archivo.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("El archivo está vacío"));
        }

        String nombre = archivo.getOriginalFilename() != null
                ? archivo.getOriginalFilename().toLowerCase() : "";
        if (!nombre.endsWith(".pdf") && !nombre.endsWith(".txt")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Solo se aceptan archivos PDF o TXT"));
        }

        try {
            CVExtractadoDTO dto = cvService.extraerCV(archivo);
            return ResponseEntity.ok(ApiResponse.success("CV extraído correctamente", dto));
        } catch (Exception e) {
            log.error("Error extrayendo CV: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error procesando el CV: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/cv/save
     * Recibe el CV ya editado por el usuario y lo persiste en la BD.
     * Requiere usuario autenticado (JWT).
     */
    @PutMapping("/save")
    public ResponseEntity<ApiResponse<CVExtractadoDTO>> guardarCV(
            @RequestBody CVExtractadoDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Debe iniciar sesión para guardar el CV"));
        }

        try {
            CVExtractadoDTO guardado = cvService.guardarCV(dto, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("CV guardado correctamente", guardado));
        } catch (Exception e) {
            log.error("Error guardando CV: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error guardando el CV: " + e.getMessage()));
        }
    }

    /**
     * GET /api/cv/me
     * Devuelve el CV guardado del usuario autenticado.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<CVExtractadoDTO>> obtenerMiCV(
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Debe iniciar sesión"));
        }

        try {
            CVExtractadoDTO dto = cvService.obtenerCV(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("CV obtenido", dto));
        } catch (RuntimeException e) {
            // El usuario no tiene CV guardado aún
            return ResponseEntity.ok(ApiResponse.success("Sin CV guardado aún", new CVExtractadoDTO()));
        } catch (Exception e) {
            log.error("Error obteniendo CV: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error obteniendo el CV: " + e.getMessage()));
        }
    }
}
