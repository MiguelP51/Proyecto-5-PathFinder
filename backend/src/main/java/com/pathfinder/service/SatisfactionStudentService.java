package com.pathfinder.service;

import com.pathfinder.dto.student.satisfaction.PendingSurveyResponseDTO;
import com.pathfinder.dto.student.satisfaction.SubmitSurveyRequestDTO;

import java.util.Optional;

public interface SatisfactionStudentService {
    Optional<PendingSurveyResponseDTO> getPendingSurvey(String targetType, Integer targetId, Integer studentId);
    void submitSurvey(SubmitSurveyRequestDTO request, Integer studentId);
}
