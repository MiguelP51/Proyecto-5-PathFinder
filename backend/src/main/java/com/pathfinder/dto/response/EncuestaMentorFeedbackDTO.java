package com.pathfinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EncuestaMentorFeedbackDTO {
    private Integer idEntrevista;
    private String fecha;
    private String puestoInteres;
    private List<RespuestaItem> respuestas;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RespuestaItem {
        private String textoPregunta;
        private String tipoPregunta;
        private Integer valorEntero;
        private String valorTexto;
    }
}
