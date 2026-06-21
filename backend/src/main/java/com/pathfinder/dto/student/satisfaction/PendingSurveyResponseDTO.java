package com.pathfinder.dto.student.satisfaction;

import com.pathfinder.dto.admin.satisfaction.SatisfactionQuestionDTO;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PendingSurveyResponseDTO {
    private Integer idSurvey;
    private String title;
    private List<SatisfactionQuestionDTO> questions;
}
