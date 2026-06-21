package com.pathfinder.service.impl;

import com.pathfinder.dto.admin.satisfaction.SatisfactionQuestionDTO;
import com.pathfinder.dto.admin.satisfaction.SatisfactionSurveyRequestDTO;
import com.pathfinder.dto.admin.satisfaction.SatisfactionSurveyResponseDTO;
import com.pathfinder.dto.admin.satisfaction.SatisfactionSubmissionResponseDTO;
import com.pathfinder.model.entity.SatisfactionAnswer;
import com.pathfinder.model.entity.SatisfactionQuestion;
import com.pathfinder.model.entity.SatisfactionSurvey;
import com.pathfinder.model.entity.SatisfactionSubmission;
import com.pathfinder.repository.SatisfactionAnswerRepository;
import com.pathfinder.repository.SatisfactionQuestionRepository;
import com.pathfinder.repository.SatisfactionSurveyRepository;
import com.pathfinder.repository.SatisfactionSubmissionRepository;
import com.pathfinder.service.SatisfactionAdminService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SatisfactionAdminServiceImpl implements SatisfactionAdminService {

    private final SatisfactionSurveyRepository surveyRepository;
    private final SatisfactionQuestionRepository questionRepository;
    private final SatisfactionSubmissionRepository submissionRepository;
    private final SatisfactionAnswerRepository answerRepository;

    @Override
    @Transactional
    public SatisfactionSurveyResponseDTO createSurvey(SatisfactionSurveyRequestDTO request) {
        SatisfactionSurvey survey = new SatisfactionSurvey();
        survey.setTitle(request.getTitle());
        survey.setStatus(request.getStatus() != null ? request.getStatus() : "DRAFT");
        
        SatisfactionSurvey savedSurvey = surveyRepository.save(survey);
        
        saveQuestions(request.getQuestions(), savedSurvey);
        
        if ("ACTIVE".equalsIgnoreCase(savedSurvey.getStatus())) {
            archiveOtherActiveSurveys(savedSurvey.getIdSurvey());
        }

        return getSurveyById(savedSurvey.getIdSurvey());
    }

    @Override
    @Transactional
    public SatisfactionSurveyResponseDTO updateSurvey(Integer id, SatisfactionSurveyRequestDTO request) {
        SatisfactionSurvey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Survey no encontrada"));
        
        if ("ACTIVE".equalsIgnoreCase(survey.getStatus())) {
            // Auto-versioning: create a new survey under the hood
            // 1. Mark current survey as HISTORICAL
            survey.setStatus("HISTORICAL");
            surveyRepository.save(survey);
            
            // 2. Create a new survey with ACTIVE status
            SatisfactionSurvey newSurvey = new SatisfactionSurvey();
            newSurvey.setTitle(request.getTitle());
            newSurvey.setStatus("ACTIVE");
            
            SatisfactionSurvey savedSurvey = surveyRepository.save(newSurvey);
            
            // 3. Save new questions under the new survey ID
            saveQuestions(request.getQuestions(), savedSurvey);
            
            // 4. Archive any other active surveys (safety net)
            archiveOtherActiveSurveys(savedSurvey.getIdSurvey());
            
            return getSurveyById(savedSurvey.getIdSurvey());
        } else {
            // Update in-place for DRAFT or other statuses
            survey.setTitle(request.getTitle());
            survey.setStatus(request.getStatus());
            surveyRepository.save(survey);
            
            // Remove old questions and save new ones
            List<SatisfactionQuestion> oldQuestions = questionRepository.findBySurvey_IdSurveyOrderByOrderIndexAsc(id);
            questionRepository.deleteAll(oldQuestions);
            
            saveQuestions(request.getQuestions(), survey);
            
            if ("ACTIVE".equalsIgnoreCase(survey.getStatus())) {
                archiveOtherActiveSurveys(survey.getIdSurvey());
            }
            
            return getSurveyById(id);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SatisfactionSurveyResponseDTO> getAllSurveys() {
        return surveyRepository.findAll().stream()
                .filter(s -> !"HISTORICAL".equalsIgnoreCase(s.getStatus()))
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

    @Override
    @Transactional(readOnly = true)
    public List<SatisfactionSubmissionResponseDTO> getAllSubmissions() {
        return submissionRepository.findAll(Sort.by(Sort.Direction.DESC, "submittedAt")).stream()
                .map(this::mapSubmissionToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SatisfactionSubmissionResponseDTO getSubmissionById(Integer id) {
        SatisfactionSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Submission no encontrada"));
        return mapSubmissionToResponse(submission);
    }

    private void archiveOtherActiveSurveys(Integer currentSurveyId) {
        List<SatisfactionSurvey> activeSurveys = surveyRepository.findAll().stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()) 
                        && !s.getIdSurvey().equals(currentSurveyId))
                .toList();
        for (SatisfactionSurvey s : activeSurveys) {
            s.setStatus("HISTORICAL");
            surveyRepository.save(s);
        }
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
                q.setSection(qDto.getSection());
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
            dto.setSection(q.getSection());
            return dto;
        }).collect(Collectors.toList());
        
        return SatisfactionSurveyResponseDTO.builder()
                .idSurvey(survey.getIdSurvey())
                .title(survey.getTitle())
                .status(survey.getStatus())
                .questions(qDtos)
                .build();
    }

    private SatisfactionSubmissionResponseDTO mapSubmissionToResponse(SatisfactionSubmission submission) {
        List<SatisfactionAnswer> answers = answerRepository.findBySubmission_IdSubmission(submission.getIdSubmission());
        
        List<SatisfactionSubmissionResponseDTO.AnswerDTO> answerDTOs = answers.stream().map(a -> 
            SatisfactionSubmissionResponseDTO.AnswerDTO.builder()
                    .questionText(a.getQuestion().getQuestionText())
                    .questionType(a.getQuestion().getQuestionType())
                    .section(a.getQuestion().getSection())
                    .ratingValue(a.getRatingValue())
                    .textValue(a.getTextValue())
                    .build()
        ).collect(Collectors.toList());

        return SatisfactionSubmissionResponseDTO.builder()
                .idSubmission(submission.getIdSubmission())
                .studentName(submission.getStudent().getNombreCompleto())
                .studentEmail(submission.getStudent().getCorreo())
                .surveyTitle(submission.getSurvey().getTitle())
                .submittedAt(submission.getSubmittedAt())
                .answers(answerDTOs)
                .build();
    }
}
