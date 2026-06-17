package com.pathfinder.service.impl;

import com.pathfinder.dto.admin.satisfaction.SatisfactionQuestionDTO;
import com.pathfinder.dto.student.satisfaction.PendingSurveyResponseDTO;
import com.pathfinder.dto.student.satisfaction.SubmitAnswerRequestDTO;
import com.pathfinder.dto.student.satisfaction.SubmitSurveyRequestDTO;
import com.pathfinder.model.entity.*;
import com.pathfinder.repository.*;
import com.pathfinder.service.SatisfactionStudentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SatisfactionStudentServiceImpl implements SatisfactionStudentService {

    private final SatisfactionSurveyRepository surveyRepository;
    private final SatisfactionQuestionRepository questionRepository;
    private final SatisfactionSubmissionRepository submissionRepository;
    private final SatisfactionAnswerRepository answerRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public Optional<PendingSurveyResponseDTO> getPendingSurvey(String targetType, Integer targetId, Integer studentId) {
        // Find if an active survey applies to this specific target
        Optional<SatisfactionSurvey> specificSurveyOpt = surveyRepository.findFirstByTargetTypeAndTargetIdAndStatus(targetType, targetId, "ACTIVE");
        
        SatisfactionSurvey survey;
        if (specificSurveyOpt.isPresent()) {
            survey = specificSurveyOpt.get();
        } else {
            // Check if there is a generic one
            Optional<SatisfactionSurvey> genericSurveyOpt = surveyRepository.findFirstByTargetTypeAndTargetIdAndStatus(targetType, null, "ACTIVE");
            if (genericSurveyOpt.isPresent()) {
                survey = genericSurveyOpt.get();
            } else {
                return Optional.empty();
            }
        }

        // Check if student already submitted for this target
        boolean alreadySubmitted = submissionRepository.existsBySurvey_IdSurveyAndStudent_IdUsuarioAndTargetId(survey.getIdSurvey(), studentId, targetId);
        if (alreadySubmitted) {
            return Optional.empty();
        }

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

        return Optional.of(PendingSurveyResponseDTO.builder()
                .idSurvey(survey.getIdSurvey())
                .title(survey.getTitle())
                .targetType(survey.getTargetType())
                .targetId(survey.getTargetId())
                .questions(qDtos)
                .build());
    }

    @Override
    @Transactional
    public void submitSurvey(SubmitSurveyRequestDTO request, Integer studentId) {
        SatisfactionSurvey survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new EntityNotFoundException("Survey no encontrada"));
        
        Usuario student = usuarioRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        // Anti-duplicate check
        if (submissionRepository.existsBySurvey_IdSurveyAndStudent_IdUsuarioAndTargetId(request.getSurveyId(), studentId, request.getTargetId())) {
            return;
        }

        SatisfactionSubmission submission = new SatisfactionSubmission();
        submission.setSurvey(survey);
        submission.setStudent(student);
        submission.setTargetId(request.getTargetId());
        
        SatisfactionSubmission savedSubmission = submissionRepository.save(submission);

        if (request.getAnswers() != null) {
            for (SubmitAnswerRequestDTO ansReq : request.getAnswers()) {
                SatisfactionQuestion question = questionRepository.findById(ansReq.getQuestionId())
                        .orElseThrow(() -> new EntityNotFoundException("Pregunta no encontrada"));
                
                SatisfactionAnswer answer = new SatisfactionAnswer();
                answer.setSubmission(savedSubmission);
                answer.setQuestion(question);
                answer.setRatingValue(ansReq.getRatingValue());
                answer.setTextValue(ansReq.getTextValue());
                
                answerRepository.save(answer);
            }
        }
    }
}
