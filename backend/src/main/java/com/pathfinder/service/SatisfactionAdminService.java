package com.pathfinder.service;

import com.pathfinder.dto.admin.satisfaction.SatisfactionSurveyRequestDTO;
import com.pathfinder.dto.admin.satisfaction.SatisfactionSurveyResponseDTO;

import java.util.List;

public interface SatisfactionAdminService {
    SatisfactionSurveyResponseDTO createSurvey(SatisfactionSurveyRequestDTO request);
    SatisfactionSurveyResponseDTO updateSurvey(Integer id, SatisfactionSurveyRequestDTO request);
    List<SatisfactionSurveyResponseDTO> getAllSurveys();
    SatisfactionSurveyResponseDTO getSurveyById(Integer id);
}
