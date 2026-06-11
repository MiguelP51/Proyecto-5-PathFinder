package com.pathfinder.controller;

import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.SkillPathActivoDTO;
import com.pathfinder.dto.response.SkillPathEstudianteResponseDTO;
import com.pathfinder.model.entity.SkillPath;
import com.pathfinder.repository.SkillPathRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.pathfinder.dto.response.SkillPathEstudianteResponseDTO;
import com.pathfinder.service.SkillPathService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/skillpaths")
@RequiredArgsConstructor
public class SkillPathController {

    private final SkillPathRepository skillPathRepository;
    private final SkillPathService skillPathService;

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

    // GET /api/skillpaths/estudiante
// GET /api/skillpaths/estudiante?subareaId=gestion-desempeno
// Endpoint usado por el nuevo frontend de SkillPath.
    @GetMapping("/estudiante")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<List<SkillPathEstudianteResponseDTO>>> getSkillPathsEstudiante(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String subareaId
    ) {
        try {
            List<SkillPathEstudianteResponseDTO> skillPaths =
                    skillPathService.listarSkillPathsEstudiante(
                            userDetails.getUsername(),
                            subareaId
                    );

            return ResponseEntity.ok(
                    ApiResponse.success("SkillPaths del estudiante obtenidos", skillPaths)
            );
        } catch (Exception e) {
            log.error("Error obteniendo SkillPaths del estudiante: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener SkillPaths del estudiante"));
        }
    }

    @GetMapping("/estudiante/iniciados")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<List<SkillPathEstudianteResponseDTO>>> listarSkillPathsIniciadosEstudiante(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            List<SkillPathEstudianteResponseDTO> skillPaths =
                    skillPathService.listarSkillPathsIniciadosEstudiante(
                            userDetails.getUsername()
                    );

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "SkillPaths iniciados del estudiante obtenidos",
                            skillPaths
                    )
            );
        } catch (Exception e) {
            log.error("Error listando SkillPaths iniciados: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener SkillPaths iniciados"));
        }
    }

    // GET /api/skillpaths/estudiante/{idSkillPath}
// Endpoint usado por la pantalla de detalle del nuevo frontend.
    @GetMapping("/estudiante/{idSkillPath}")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<SkillPathEstudianteResponseDTO>> getSkillPathEstudiantePorId(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer idSkillPath
    ) {
        try {
            SkillPathEstudianteResponseDTO skillPath =
                    skillPathService.obtenerSkillPathEstudiantePorId(
                            userDetails.getUsername(),
                            idSkillPath
                    );

            return ResponseEntity.ok(
                    ApiResponse.success("SkillPath del estudiante obtenido", skillPath)
            );
        } catch (IllegalArgumentException e) {
            log.warn("SkillPath no encontrado para el estudiante: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error obteniendo detalle de SkillPath del estudiante: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener detalle del SkillPath"));
        }
    }

    // POST /api/skillpaths/estudiante/{idSkillPath}/iniciar
// Crea o actualiza el avance del estudiante sobre un SkillPath.
    @PostMapping("/estudiante/{idSkillPath}/iniciar")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<SkillPathEstudianteResponseDTO>> iniciarSkillPathEstudiante(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer idSkillPath
    ) {
        try {
            SkillPathEstudianteResponseDTO skillPath =
                    skillPathService.iniciarSkillPathEstudiante(
                            userDetails.getUsername(),
                            idSkillPath
                    );

            return ResponseEntity.ok(
                    ApiResponse.success("SkillPath iniciado correctamente", skillPath)
            );
        } catch (IllegalArgumentException e) {
            log.warn("No se pudo iniciar SkillPath: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error iniciando SkillPath: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al iniciar SkillPath"));
        }
    }

    @PostMapping(
            value = "/estudiante/{idSkillPath}/evidencia",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<SkillPathEstudianteResponseDTO>> subirEvidenciaSkillPath(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer idSkillPath,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            SkillPathEstudianteResponseDTO skillPath =
                    skillPathService.subirEvidenciaSkillPath(
                            userDetails.getUsername(),
                            idSkillPath,
                            file
                    );

            return ResponseEntity.ok(
                    ApiResponse.success("Evidencia enviada correctamente", skillPath)
            );
        } catch (IllegalArgumentException e) {
            log.warn("No se pudo subir evidencia: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error subiendo evidencia: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al subir la evidencia"));
        }
    }

    @DeleteMapping("/estudiante/{idSkillPath}/evidencia")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<SkillPathEstudianteResponseDTO>> eliminarEvidenciaSkillPath(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer idSkillPath
    ) {
        try {
            SkillPathEstudianteResponseDTO skillPath =
                    skillPathService.eliminarEvidenciaSkillPath(
                            userDetails.getUsername(),
                            idSkillPath
                    );

            return ResponseEntity.ok(
                    ApiResponse.success("Evidencia eliminada correctamente", skillPath)
            );
        } catch (IllegalArgumentException e) {
            log.warn("No se pudo eliminar evidencia: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error eliminando evidencia: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al eliminar la evidencia"));
        }
    }

    @GetMapping("/estudiante/{idSkillPath}/evidencia/download")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<byte[]> descargarEvidenciaSkillPath(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer idSkillPath
    ) {
        try {
            byte[] data = skillPathService.descargarEvidenciaSkillPath(
                    userDetails.getUsername(),
                    idSkillPath
            );

            String nombreArchivo = skillPathService.obtenerNombreEvidenciaSkillPath(
                    userDetails.getUsername(),
                    idSkillPath
            );

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + nombreArchivo + "\""
                    )
                    .body(data);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            log.error("Error descargando evidencia de SkillPath: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
