package com.pathfinder.controller;

import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.student.pathchallenge.PathChallengeAvanceRequestDTO;
import com.pathfinder.dto.student.pathchallenge.PathChallengeEstudianteResponseDTO;
import com.pathfinder.dto.student.pathchallenge.PathChallengeFinalizarRequestDTO;
import com.pathfinder.service.PathChallengeEstudianteService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/pathchallenges")
@RequiredArgsConstructor
public class PathChallengeEstudianteController {

    private final PathChallengeEstudianteService pathChallengeEstudianteService;

    @GetMapping("/estudiante")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<List<PathChallengeEstudianteResponseDTO>>> listarPorSubarea(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Integer subareaId
    ) {
        try {
            List<PathChallengeEstudianteResponseDTO> challenges =
                    pathChallengeEstudianteService.listarPorSubarea(
                            userDetails.getUsername(),
                            subareaId
                    );

            return ResponseEntity.ok(
                    ApiResponse.success("PathChallenges del estudiante obtenidos", challenges)
            );
        } catch (Exception e) {
            log.error("Error obteniendo PathChallenges del estudiante: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener PathChallenges del estudiante"));
        }
    }

    @GetMapping("/estudiante/iniciados")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<List<PathChallengeEstudianteResponseDTO>>> listarIniciados(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            List<PathChallengeEstudianteResponseDTO> challenges =
                    pathChallengeEstudianteService.listarIniciados(
                            userDetails.getUsername()
                    );

            return ResponseEntity.ok(
                    ApiResponse.success("PathChallenges iniciados obtenidos", challenges)
            );
        } catch (Exception e) {
            log.error("Error obteniendo PathChallenges iniciados: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener PathChallenges iniciados"));
        }
    }

    @GetMapping("/estudiante/{idPathChallenge}")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<PathChallengeEstudianteResponseDTO>> obtenerDetalle(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer idPathChallenge
    ) {
        try {
            PathChallengeEstudianteResponseDTO challenge =
                    pathChallengeEstudianteService.obtenerDetalle(
                            userDetails.getUsername(),
                            idPathChallenge
                    );

            return ResponseEntity.ok(
                    ApiResponse.success("PathChallenge del estudiante obtenido", challenge)
            );
        } catch (EntityNotFoundException e) {
            log.warn("PathChallenge no encontrado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error obteniendo detalle de PathChallenge: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener detalle del PathChallenge"));
        }
    }

    @PostMapping("/estudiante/{idPathChallenge}/iniciar")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<PathChallengeEstudianteResponseDTO>> iniciar(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer idPathChallenge
    ) {
        try {
            PathChallengeEstudianteResponseDTO challenge =
                    pathChallengeEstudianteService.iniciar(
                            userDetails.getUsername(),
                            idPathChallenge
                    );

            return ResponseEntity.ok(
                    ApiResponse.success("PathChallenge iniciado correctamente", challenge)
            );
        } catch (EntityNotFoundException e) {
            log.warn("No se pudo iniciar PathChallenge: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.warn("No se pudo iniciar PathChallenge: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error iniciando PathChallenge: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al iniciar PathChallenge"));
        }
    }

    @PutMapping("/estudiante/{idPathChallenge}/avance")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<PathChallengeEstudianteResponseDTO>> guardarAvance(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer idPathChallenge,
            @RequestBody PathChallengeAvanceRequestDTO request
    ) {
        try {
            PathChallengeEstudianteResponseDTO challenge =
                    pathChallengeEstudianteService.guardarAvance(
                            userDetails.getUsername(),
                            idPathChallenge,
                            request
                    );

            return ResponseEntity.ok(
                    ApiResponse.success("Avance de PathChallenge guardado correctamente", challenge)
            );
        } catch (EntityNotFoundException e) {
            log.warn("No se pudo guardar avance de PathChallenge: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.warn("No se pudo guardar avance de PathChallenge: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error guardando avance de PathChallenge: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al guardar avance del PathChallenge"));
        }
    }

    @PostMapping("/estudiante/{idPathChallenge}/finalizar")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<PathChallengeEstudianteResponseDTO>> finalizar(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer idPathChallenge,
            @RequestBody PathChallengeFinalizarRequestDTO request
    ) {
        try {
            PathChallengeEstudianteResponseDTO challenge =
                    pathChallengeEstudianteService.finalizar(
                            userDetails.getUsername(),
                            idPathChallenge,
                            request
                    );

            return ResponseEntity.ok(
                    ApiResponse.success("PathChallenge finalizado correctamente", challenge)
            );
        } catch (EntityNotFoundException e) {
            log.warn("No se pudo finalizar PathChallenge: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.warn("No se pudo finalizar PathChallenge: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error finalizando PathChallenge: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al finalizar PathChallenge"));
        }
    }

    @PostMapping(
            value = "/estudiante/{idPathChallenge}/tareas/{idPathChallengeTask}/archivo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<PathChallengeEstudianteResponseDTO>> subirArchivoTarea(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer idPathChallenge,
            @PathVariable Integer idPathChallengeTask,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            PathChallengeEstudianteResponseDTO challenge =
                    pathChallengeEstudianteService.subirArchivoTarea(
                            userDetails.getUsername(),
                            idPathChallenge,
                            idPathChallengeTask,
                            file
                    );

            return ResponseEntity.ok(
                    ApiResponse.success("Archivo subido correctamente", challenge)
            );
        } catch (IllegalArgumentException e) {
            log.warn("No se pudo subir archivo de PathChallenge: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error subiendo archivo de PathChallenge: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al subir el archivo"));
        }
    }

    @GetMapping("/estudiante/{idPathChallenge}/tareas/{idPathChallengeTask}/archivo/download")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<byte[]> descargarArchivoTarea(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer idPathChallenge,
            @PathVariable Integer idPathChallengeTask
    ) {
        try {
            byte[] data = pathChallengeEstudianteService.descargarArchivoTarea(
                    userDetails.getUsername(),
                    idPathChallenge,
                    idPathChallengeTask
            );

            String nombreArchivo = pathChallengeEstudianteService.obtenerNombreArchivoTarea(
                    userDetails.getUsername(),
                    idPathChallenge,
                    idPathChallengeTask
            );

            MediaType mediaType = obtenerMediaTypePorNombre(nombreArchivo);
            String disposition = debeAbrirseEnNavegador(nombreArchivo)
                    ? "inline"
                    : "attachment";

            String nombreCodificado = URLEncoder
                    .encode(nombreArchivo, StandardCharsets.UTF_8)
                    .replace("+", "%20");

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            disposition + "; filename*=UTF-8''" + nombreCodificado
                    )
                    .body(data);

        } catch (IllegalArgumentException e) {
            log.warn("No se pudo descargar archivo de PathChallenge: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            log.error("Error descargando archivo de PathChallenge: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/estudiante/{idPathChallenge}/tareas/{idPathChallengeTask}/recurso/{tipoRecurso}/download")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<byte[]> descargarRecursoBaseTarea(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer idPathChallenge,
            @PathVariable Integer idPathChallengeTask,
            @PathVariable String tipoRecurso
    ) {
        try {
            byte[] data = pathChallengeEstudianteService.descargarRecursoBaseTarea(
                    userDetails.getUsername(),
                    idPathChallenge,
                    idPathChallengeTask,
                    tipoRecurso
            );

            String nombreArchivo = pathChallengeEstudianteService.obtenerNombreRecursoBaseTarea(
                    userDetails.getUsername(),
                    idPathChallenge,
                    idPathChallengeTask,
                    tipoRecurso
            );

            MediaType mediaType = obtenerMediaTypePorNombre(nombreArchivo);
            String disposition = debeAbrirseEnNavegador(nombreArchivo)
                    ? "inline"
                    : "attachment";

            String nombreCodificado = URLEncoder
                    .encode(nombreArchivo, StandardCharsets.UTF_8)
                    .replace("+", "%20");

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            disposition + "; filename*=UTF-8''" + nombreCodificado
                    )
                    .body(data);

        } catch (IllegalArgumentException e) {
            log.warn("No se pudo descargar recurso base de PathChallenge: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            log.error("Error descargando recurso base de PathChallenge: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private MediaType obtenerMediaTypePorNombre(String nombreArchivo) {
        if (nombreArchivo == null) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }

        String nombre = nombreArchivo.toLowerCase();

        if (nombre.endsWith(".pdf")) {
            return MediaType.APPLICATION_PDF;
        }

        if (nombre.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        }

        if (nombre.endsWith(".jpg") || nombre.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG;
        }

        if (nombre.endsWith(".docx")) {
            return MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            );
        }

        if (nombre.endsWith(".xlsx")) {
            return MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
        }

        return MediaType.APPLICATION_OCTET_STREAM;
    }

    private boolean debeAbrirseEnNavegador(String nombreArchivo) {
        if (nombreArchivo == null) {
            return false;
        }

        String nombre = nombreArchivo.toLowerCase();

        return nombre.endsWith(".pdf")
                || nombre.endsWith(".png")
                || nombre.endsWith(".jpg")
                || nombre.endsWith(".jpeg");
    }
}