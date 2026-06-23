package com.pathfinder.dto.admin.satisfaction;

import lombok.Data;

@Data
public class SatisfactionQuestionDTO {
    private Integer idQuestion;
    private String questionText;
    private String questionType;
    private Boolean isMandatory;
    private Integer orderIndex;
    private String section;
}
