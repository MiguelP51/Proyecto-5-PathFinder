package com.pathfinder.dto.student.pathchallenge;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PathChallengeAvanceRequestDTO {

    private List<Integer> completedTaskIds;

    private String entregaTexto;
}