package com.pathfinder.dto.admin.satisfaction;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SatisfactionSurveyResponseDTO {
    private Integer idSurvey;
    private String title;
    private String status;
    private List<SatisfactionQuestionDTO> questions;
}
