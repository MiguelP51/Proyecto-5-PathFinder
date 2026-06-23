package com.pathfinder.dto.student.pathchallenge;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PathChallengeTaskResponseRequestDTO {

    private Integer idPathChallengeTask;

    private Boolean completed;

    private String responseText;

    private String selectedOption;

    private String fileName;

    private String fileUrl;
}