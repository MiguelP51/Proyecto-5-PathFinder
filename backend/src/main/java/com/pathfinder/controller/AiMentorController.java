package com.pathfinder.controller;

import com.pathfinder.dto.ai.MentorFeedbackDraftRequestDTO;
import com.pathfinder.dto.ai.MentorFeedbackDraftResponseDTO;
import com.pathfinder.dto.ai.MentorInterviewRecommendationsResponseDTO;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.service.ai.MentorFeedbackAiService;
import com.pathfinder.service.ai.MentorInterviewAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/ai/mentor")
@RequiredArgsConstructor
public class AiMentorController {

    private final MentorInterviewAiService mentorInterviewAiService;
    private final MentorFeedbackAiService mentorFeedbackAiService;

    @PostMapping("/entrevistas/{idEntrevista}/recomendaciones")
    @PreAuthorize("hasAnyAuthority('MENTOR', 'ROLE_MENTOR', 'ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<MentorInterviewRecommendationsResponseDTO>> generarRecomendacionesEntrevista(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer idEntrevista
    ) {
        try {
            MentorInterviewRecommendationsResponseDTO response =
                    mentorInterviewAiService.generarRecomendaciones(
                            userDetails.getUsername(),
                            idEntrevista
                    );

            return ResponseEntity.ok(
                    ApiResponse.success("Recomendaciones IA generadas correctamente", response)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            log.warn("No se pudo generar recomendaciones IA para mentor: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error generando recomendaciones IA para mentor: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al generar recomendaciones IA para mentor: "
                            + e.getClass().getSimpleName() + " - " + e.getMessage()));
        }
    }

    @PostMapping("/entrevistas/{idEntrevista}/feedback-borrador")
    @PreAuthorize("hasAnyAuthority('MENTOR', 'ROLE_MENTOR', 'ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<MentorFeedbackDraftResponseDTO>> generarBorradorFeedback(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer idEntrevista,
            @RequestBody(required = false) MentorFeedbackDraftRequestDTO request
    ) {
        try {
            MentorFeedbackDraftResponseDTO response =
                    mentorFeedbackAiService.generarBorrador(
                            userDetails.getUsername(),
                            idEntrevista,
                            request
                    );

            return ResponseEntity.ok(
                    ApiResponse.success("Borrador de feedback generado correctamente", response)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            log.warn("No se pudo generar borrador de feedback IA: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error generando borrador de feedback IA: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al generar borrador de feedback IA: "
                            + e.getClass().getSimpleName() + " - " + e.getMessage()));
        }
    }
}
