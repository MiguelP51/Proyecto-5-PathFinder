package com.pathfinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRecentDTO {
    private String estudianteNombre;
    private String fecha;
    private Double puntaje;
    private String resultado;
}
