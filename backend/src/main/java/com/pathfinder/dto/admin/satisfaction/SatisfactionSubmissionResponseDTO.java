package com.pathfinder.dto.admin.satisfaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SatisfactionSubmissionResponseDTO {
    private Integer idSubmission;
    private String studentName;
    private String studentEmail;
    private String surveyTitle;
    private LocalDateTime submittedAt;
    private List<AnswerDTO> answers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerDTO {
        private String questionText;
        private String questionType;
        private String section;
        private Integer ratingValue;
        private String textValue;
    }
}
