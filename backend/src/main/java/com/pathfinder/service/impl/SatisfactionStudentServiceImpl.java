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
    public Optional<PendingSurveyResponseDTO> getPendingSurvey(Integer studentId) {
        // Find if there is an active survey
        Optional<SatisfactionSurvey> activeSurveyOpt = surveyRepository.findFirstByStatus("ACTIVE");
        if (activeSurveyOpt.isEmpty()) {
            return Optional.empty();
        }

        SatisfactionSurvey survey = activeSurveyOpt.get();

        // Check if student already submitted for this survey
        boolean alreadySubmitted = submissionRepository.existsBySurvey_IdSurveyAndStudent_IdUsuario(survey.getIdSurvey(), studentId);
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
            dto.setSection(q.getSection());
            return dto;
        }).collect(Collectors.toList());

        return Optional.of(PendingSurveyResponseDTO.builder()
                .idSurvey(survey.getIdSurvey())
                .title(survey.getTitle())
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
        if (submissionRepository.existsBySurvey_IdSurveyAndStudent_IdUsuario(request.getSurveyId(), studentId)) {
            return;
        }

        SatisfactionSubmission submission = new SatisfactionSubmission();
        submission.setSurvey(survey);
        submission.setStudent(student);
        
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
