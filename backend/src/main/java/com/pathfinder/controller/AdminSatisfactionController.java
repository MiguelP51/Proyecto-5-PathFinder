package com.pathfinder.controller;

import com.pathfinder.dto.admin.satisfaction.SatisfactionSurveyRequestDTO;
import com.pathfinder.dto.admin.satisfaction.SatisfactionSurveyResponseDTO;
import com.pathfinder.dto.admin.satisfaction.SatisfactionSubmissionResponseDTO;
import com.pathfinder.service.SatisfactionAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/satisfaction/surveys")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminSatisfactionController {

    private final SatisfactionAdminService adminService;

    @PostMapping
    public ResponseEntity<SatisfactionSurveyResponseDTO> createSurvey(@RequestBody SatisfactionSurveyRequestDTO request) {
        return ResponseEntity.ok(adminService.createSurvey(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SatisfactionSurveyResponseDTO> updateSurvey(@PathVariable Integer id, @RequestBody SatisfactionSurveyRequestDTO request) {
        return ResponseEntity.ok(adminService.updateSurvey(id, request));
    }

    @GetMapping
    public ResponseEntity<List<SatisfactionSurveyResponseDTO>> getAllSurveys() {
        return ResponseEntity.ok(adminService.getAllSurveys());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SatisfactionSurveyResponseDTO> getSurveyById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getSurveyById(id));
    }

    @GetMapping("/submissions")
    public ResponseEntity<List<SatisfactionSubmissionResponseDTO>> getAllSubmissions() {
        return ResponseEntity.ok(adminService.getAllSubmissions());
    }

    @GetMapping("/submissions/{id}")
    public ResponseEntity<SatisfactionSubmissionResponseDTO> getSubmissionById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getSubmissionById(id));
    }
}
