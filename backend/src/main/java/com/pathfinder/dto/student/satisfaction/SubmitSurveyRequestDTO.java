package com.pathfinder.dto.student.satisfaction;

import lombok.Data;
import java.util.List;

@Data
public class SubmitSurveyRequestDTO {
    private Integer surveyId;
    private Integer targetId;
    private List<SubmitAnswerRequestDTO> answers;
}
