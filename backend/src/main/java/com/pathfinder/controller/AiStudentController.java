package com.pathfinder.controller;

import com.pathfinder.dto.ai.StudentCvSuggestionsRequestDTO;
import com.pathfinder.dto.ai.StudentCvSuggestionsResponseDTO;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.service.ai.StudentCvAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/ai/estudiante")
@RequiredArgsConstructor
public class AiStudentController {

    private final StudentCvAiService studentCvAiService;

    @PostMapping("/perfil-cv/sugerencias")
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<StudentCvSuggestionsResponseDTO>> generarSugerenciasPerfilCv(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody(required = false) StudentCvSuggestionsRequestDTO request
    ) {
        try {
            StudentCvSuggestionsResponseDTO response = studentCvAiService.generarSugerencias(
                    userDetails.getUsername(),
                    request != null ? request : new StudentCvSuggestionsRequestDTO()
            );

            return ResponseEntity.ok(
                    ApiResponse.success("Sugerencias de perfil/CV generadas correctamente", response)
            );
        } catch (IllegalStateException e) {
            log.warn("No se pudo generar sugerencias de perfil/CV: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error generando sugerencias de perfil/CV: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al generar sugerencias de perfil/CV"));
        }
    }
}
