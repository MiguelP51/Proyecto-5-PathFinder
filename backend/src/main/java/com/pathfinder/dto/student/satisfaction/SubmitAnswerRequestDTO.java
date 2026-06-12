package com.pathfinder.dto.student.satisfaction;

import lombok.Data;

@Data
public class SubmitAnswerRequestDTO {
    private Integer questionId;
    private Integer ratingValue;
    private String textValue;
}
