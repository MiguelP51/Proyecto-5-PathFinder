package com.pathfinder.dto.admin.curso;

import com.pathfinder.model.enums.EstadoEnlace;
import com.pathfinder.model.enums.NivelCurso;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateCursoRequestDTO {

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotBlank(message = "La URL es obligatoria")
    private String url;

    private String descripcion;
    
    private NivelCurso nivel;
    
    private String duracion;

    @NotNull(message = "El XP no puede ser nulo")
    @Min(value = 0, message = "El XP no puede ser negativo")
    private Integer xp;

    @NotNull(message = "El estado del enlace es obligatorio")
    private EstadoEnlace estadoEnlace;

    @NotNull(message = "Debe indicar si es gratuito")
    private Boolean esGratuito;
}
