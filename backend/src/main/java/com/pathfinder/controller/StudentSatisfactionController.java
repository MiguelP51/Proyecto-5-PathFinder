package com.pathfinder.controller;

import com.pathfinder.dto.student.satisfaction.PendingSurveyResponseDTO;
import com.pathfinder.dto.student.satisfaction.SubmitSurveyRequestDTO;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.service.SatisfactionStudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/student/satisfaction")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentSatisfactionController {

    private final SatisfactionStudentService studentService;

    @GetMapping("/pending")
    public ResponseEntity<PendingSurveyResponseDTO> getPendingSurvey(
            @RequestParam String targetType,
            @RequestParam(required = false) Integer targetId,
            @AuthenticationPrincipal Usuario usuario) {
        
        try {
            Optional<PendingSurveyResponseDTO> surveyOpt = studentService.getPendingSurvey(targetType, targetId, usuario.getIdUsuario());
            return surveyOpt.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.noContent().build());
        } catch (Exception e) {
            // Failsafe for zero-regression
            return ResponseEntity.noContent().build();
        }
    }

    @PostMapping("/submissions")
    public ResponseEntity<Void> submitSurvey(
            @RequestBody SubmitSurveyRequestDTO request,
            @AuthenticationPrincipal Usuario usuario) {
        studentService.submitSurvey(request, usuario.getIdUsuario());
        return ResponseEntity.ok().build();
    }
}
