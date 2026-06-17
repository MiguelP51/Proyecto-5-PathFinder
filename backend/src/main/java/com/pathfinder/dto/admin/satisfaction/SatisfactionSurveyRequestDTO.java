package com.pathfinder.dto.admin.satisfaction;

import lombok.Data;
import java.util.List;

@Data
public class SatisfactionSurveyRequestDTO {
    private String title;
    private String targetType;
    private Integer targetId;
    private String status;
    private List<SatisfactionQuestionDTO> questions;
}
