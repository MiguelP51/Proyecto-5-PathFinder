package com.pathfinder.dto.student.pathchallenge;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PathChallengeFinalizarRequestDTO {

    private List<Integer> completedTaskIds;

    private List<PathChallengeTaskResponseRequestDTO> taskResponses;

    private String entregaTexto;
}