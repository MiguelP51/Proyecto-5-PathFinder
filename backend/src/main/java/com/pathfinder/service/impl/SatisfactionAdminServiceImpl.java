package com.pathfinder.service.impl;

import com.pathfinder.dto.admin.satisfaction.SatisfactionQuestionDTO;
import com.pathfinder.dto.admin.satisfaction.SatisfactionSurveyRequestDTO;
import com.pathfinder.dto.admin.satisfaction.SatisfactionSurveyResponseDTO;
import com.pathfinder.model.entity.SatisfactionQuestion;
import com.pathfinder.model.entity.SatisfactionSurvey;
import com.pathfinder.repository.SatisfactionQuestionRepository;
import com.pathfinder.repository.SatisfactionSurveyRepository;
import com.pathfinder.service.SatisfactionAdminService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SatisfactionAdminServiceImpl implements SatisfactionAdminService {

    private final SatisfactionSurveyRepository surveyRepository;
    private final SatisfactionQuestionRepository questionRepository;

    @Override
    @Transactional
    public SatisfactionSurveyResponseDTO createSurvey(SatisfactionSurveyRequestDTO request) {
        SatisfactionSurvey survey = new SatisfactionSurvey();
        survey.setTitle(request.getTitle());
        survey.setTargetType(request.getTargetType());
        survey.setTargetId(request.getTargetId());
        survey.setStatus(request.getStatus() != null ? request.getStatus() : "DRAFT");
        
        SatisfactionSurvey savedSurvey = surveyRepository.save(survey);
        
        saveQuestions(request.getQuestions(), savedSurvey);
        
        return getSurveyById(savedSurvey.getIdSurvey());
    }

    @Override
    @Transactional
    public SatisfactionSurveyResponseDTO updateSurvey(Integer id, SatisfactionSurveyRequestDTO request) {
        SatisfactionSurvey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Survey no encontrada"));
        
        survey.setTitle(request.getTitle());
        survey.setTargetType(request.getTargetType());
        survey.setTargetId(request.getTargetId());
        survey.setStatus(request.getStatus());
        
        surveyRepository.save(survey);
        
        // Remove old questions and save new ones
        List<SatisfactionQuestion> oldQuestions = questionRepository.findBySurvey_IdSurveyOrderByOrderIndexAsc(id);
        questionRepository.deleteAll(oldQuestions);
        
        saveQuestions(request.getQuestions(), survey);
        
        return getSurveyById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SatisfactionSurveyResponseDTO> getAllSurveys() {
        return surveyRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SatisfactionSurveyResponseDTO getSurveyById(Integer id) {
        SatisfactionSurvey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Survey no encontrada"));
        return mapToResponse(survey);
    }
    
    private void saveQuestions(List<SatisfactionQuestionDTO> questionDTOs, SatisfactionSurvey survey) {
        if (questionDTOs != null) {
            for (int i = 0; i < questionDTOs.size(); i++) {
                SatisfactionQuestionDTO qDto = questionDTOs.get(i);
                SatisfactionQuestion q = new SatisfactionQuestion();
                q.setSurvey(survey);
                q.setQuestionText(qDto.getQuestionText());
                q.setQuestionType(qDto.getQuestionType());
                q.setIsMandatory(qDto.getIsMandatory() != null ? qDto.getIsMandatory() : false);
                q.setOrderIndex(qDto.getOrderIndex() != null ? qDto.getOrderIndex() : i);
                questionRepository.save(q);
            }
        }
    }
    
    private SatisfactionSurveyResponseDTO mapToResponse(SatisfactionSurvey survey) {
        List<SatisfactionQuestion> questions = questionRepository.findBySurvey_IdSurveyOrderByOrderIndexAsc(survey.getIdSurvey());
        List<SatisfactionQuestionDTO> qDtos = questions.stream().map(q -> {
            SatisfactionQuestionDTO dto = new SatisfactionQuestionDTO();
            dto.setIdQuestion(q.getIdQuestion());
            dto.setQuestionText(q.getQuestionText());
            dto.setQuestionType(q.getQuestionType());
            dto.setIsMandatory(q.getIsMandatory());
            dto.setOrderIndex(q.getOrderIndex());
            return dto;
        }).collect(Collectors.toList());
        
        return SatisfactionSurveyResponseDTO.builder()
                .idSurvey(survey.getIdSurvey())
                .title(survey.getTitle())
                .targetType(survey.getTargetType())
                .targetId(survey.getTargetId())
                .status(survey.getStatus())
                .questions(qDtos)
                .build();
    }
}
