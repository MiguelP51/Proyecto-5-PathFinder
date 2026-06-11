package com.pathfinder.controller;

import com.pathfinder.dto.request.ResponderPreguntaRequest;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.DiagnosticoIniciadoDTO;
import com.pathfinder.dto.response.DiagnosticoResultadoDTO;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.service.DiagnosticoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/diagnostico")
@RequiredArgsConstructor
public class DiagnosticoController {

    private final DiagnosticoService diagnosticoService;
    private final UsuarioRepository usuarioRepository;

    // POST /api/diagnostico/subarea/{idSubarea}/iniciar
    @PostMapping("/subarea/{idSubarea}/iniciar")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<DiagnosticoIniciadoDTO>> iniciar(
            @PathVariable Integer idSubarea,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Usuario usuario = usuarioRepository.findByCorreo(userDetails.getUsername()).orElseThrow();
            DiagnosticoIniciadoDTO result = diagnosticoService.iniciarDiagnostico(idSubarea, usuario.getIdUsuario());
            return ResponseEntity.ok(ApiResponse.success("Diagnóstico iniciado", result));
        } catch (Exception e) {
            log.error("Error iniciando diagnóstico: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al iniciar diagnóstico"));
        }
    }

    // POST /api/diagnostico/{idDiagnostico}/responder
    @PostMapping("/{idDiagnostico}/responder")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Void>> responder(
            @PathVariable Integer idDiagnostico,
            @RequestBody ResponderPreguntaRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Usuario usuario = usuarioRepository.findByCorreo(userDetails.getUsername()).orElseThrow();
            diagnosticoService.responderPregunta(idDiagnostico, request, usuario.getIdUsuario());
            return ResponseEntity.ok(ApiResponse.success("Respuesta guardada", null));
        } catch (Exception e) {
            log.error("Error guardando respuesta: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al guardar respuesta"));
        }
    }

    // POST /api/diagnostico/{idDiagnostico}/finalizar
    @PostMapping("/{idDiagnostico}/finalizar")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<DiagnosticoResultadoDTO>> finalizar(
            @PathVariable Integer idDiagnostico,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Usuario usuario = usuarioRepository.findByCorreo(userDetails.getUsername()).orElseThrow();
            DiagnosticoResultadoDTO result = diagnosticoService.finalizarDiagnostico(idDiagnostico, usuario.getIdUsuario());
            return ResponseEntity.ok(ApiResponse.success("Diagnóstico finalizado", result));
        } catch (Exception e) {
            log.error("Error finalizando diagnóstico: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al finalizar diagnóstico"));
        }
    }

    // GET /api/diagnostico/{idDiagnostico}/resultado
    @GetMapping("/{idDiagnostico}/resultado")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<DiagnosticoResultadoDTO>> resultado(
            @PathVariable Integer idDiagnostico,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Usuario usuario = usuarioRepository.findByCorreo(userDetails.getUsername()).orElseThrow();
            DiagnosticoResultadoDTO result = diagnosticoService.obtenerResultado(idDiagnostico, usuario.getIdUsuario());
            return ResponseEntity.ok(ApiResponse.success("Resultado obtenido", result));
        } catch (Exception e) {
            log.error("Error obteniendo resultado: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al obtener resultado"));
        }
    }
}
