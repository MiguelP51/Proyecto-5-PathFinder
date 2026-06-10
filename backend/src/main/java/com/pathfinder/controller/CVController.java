package com.pathfinder.controller;

import com.pathfinder.dto.cv.CVExtractadoDTO;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.ArchivoCVResponse;
import com.pathfinder.service.ArchivoCVService;
import com.pathfinder.service.CVService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
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

    private static final long MAX_BYTES = 10L * 1024 * 1024; // 10 MB — RF10

    private final CVService        cvService;
    private final ArchivoCVService archivoCVService;

    // POST /api/cv/extract — extrae datos del PDF (público, HU-EST-06)
    @PostMapping(value = "/extract", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CVExtractadoDTO>> extraerCV(
            @RequestParam("archivo") MultipartFile archivo) {

        ResponseEntity<ApiResponse<CVExtractadoDTO>> error = validarArchivo(archivo);
        if (error != null) return error;

        try {
            CVExtractadoDTO dto = cvService.extraerCV(archivo);
            return ResponseEntity.ok(ApiResponse.success("CV extraído correctamente", dto));
        } catch (Exception e) {
            log.error("Error extrayendo CV: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error procesando el CV: " + e.getMessage()));
        }
    }

    // POST /api/cv/upload — registra el archivo PDF en BD (HU-EST-05, RF10, RF11)
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ArchivoCVResponse>> subirCV(
            @RequestParam("archivo") MultipartFile archivo,
            @AuthenticationPrincipal UserDetails userDetails) {

        ResponseEntity<ApiResponse<ArchivoCVResponse>> error = validarArchivo(archivo);
        if (error != null) return error;

        try {
            ArchivoCVResponse response =
                    archivoCVService.registrarArchivo(archivo, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Archivo registrado correctamente", response));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error registrando archivo CV: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error registrando el archivo"));
        }
    }

    // PUT /api/cv/save — guarda el CV editado en BD (HU-EST-07/08)
    @PutMapping("/save")
    public ResponseEntity<ApiResponse<CVExtractadoDTO>> guardarCV(
            @RequestBody CVExtractadoDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            CVExtractadoDTO guardado = cvService.guardarCV(dto, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("CV guardado correctamente", guardado));
        } catch (Exception e) {
            log.error("Error guardando CV: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error guardando el CV: " + e.getMessage()));
        }
    }

    // GET /api/cv/me — CV guardado del usuario autenticado (HU-EST-08)
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<CVExtractadoDTO>> obtenerMiCV(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            CVExtractadoDTO dto = cvService.obtenerCV(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("CV obtenido", dto));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(
                    ApiResponse.success("Sin CV guardado aún", new CVExtractadoDTO()));
        } catch (Exception e) {
            log.error("Error obteniendo CV: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error obteniendo el CV: " + e.getMessage()));
        }
    }

    // GET /api/cv/download — descarga el propio CV del estudiante
    @GetMapping("/download")
    public ResponseEntity<byte[]> descargarMiCV(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            byte[] data = cvService.obtenerArchivoCVPdf(userDetails.getUsername());
            String nombreArchivo = cvService.obtenerNombreArchivoCVPdf(userDetails.getUsername());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombreArchivo + "\"")
                    .body(data);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            log.error("Error al descargar mi CV: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/cv/download/{correo} — descarga el CV del estudiante por correo (usado por mentor/admin)
    @GetMapping("/download/{correo}")
    public ResponseEntity<byte[]> descargarCVDeEstudiante(
            @PathVariable String correo) {
        try {
            byte[] data = cvService.obtenerArchivoCVPdf(correo);
            String nombreArchivo = cvService.obtenerNombreArchivoCVPdf(correo);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombreArchivo + "\"")
                    .body(data);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            log.error("Error al descargar CV de estudiante {}: {}", correo, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Validación común de archivo — formato y tamaño
    private <T> ResponseEntity<ApiResponse<T>> validarArchivo(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty())
            return ResponseEntity.badRequest().body(ApiResponse.error("El archivo está vacío"));

        String nombre = archivo.getOriginalFilename() != null
                ? archivo.getOriginalFilename().toLowerCase() : "";
        if (!nombre.endsWith(".pdf"))
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Solo se aceptan archivos en formato PDF"));

        if (archivo.getSize() > MAX_BYTES)
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("El archivo supera el tamaño máximo permitido de 10 MB"));

        return null;
    }
}