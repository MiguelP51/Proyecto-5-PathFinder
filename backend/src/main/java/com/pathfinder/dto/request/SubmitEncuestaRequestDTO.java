package com.pathfinder.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitEncuestaRequestDTO {

    private List<RespuestaItem> respuestas;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RespuestaItem {
        private Integer idPregunta;
        private Integer valorEntero; // 1-5 rating (null if text question)
        private String valorTexto;  // open text comment (null if rating question)
    }
}
