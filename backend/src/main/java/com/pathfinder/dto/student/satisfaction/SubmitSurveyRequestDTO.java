package com.pathfinder.dto.student.satisfaction;

import lombok.Data;
import java.util.List;

@Data
public class SubmitSurveyRequestDTO {
    private Integer surveyId;
    private List<SubmitAnswerRequestDTO> answers;
}
