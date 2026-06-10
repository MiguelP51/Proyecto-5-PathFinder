package com.pathfinder.dto.admin.curso;

import com.pathfinder.model.entity.CursoExterno;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CursoExternoResponseDTO {
    private Integer idCurso;
    private String proveedorNombre;
    private String titulo;
    private String url;
    private String descripcion;
    private String nivel;
    private String duracion;
    private Integer xp;
    private String estadoEnlace;
    private Boolean esGratuito;
    private LocalDateTime ultimaVerificacion;

    public static CursoExternoResponseDTO from(CursoExterno entity) {
        return CursoExternoResponseDTO.builder()
                .idCurso(entity.getIdCurso())
                .proveedorNombre(entity.getProveedor().getNombre())
                .titulo(entity.getTitulo())
                .url(entity.getUrl())
                .descripcion(entity.getDescripcion())
                .nivel(entity.getNivel() != null ? entity.getNivel().name() : null)
                .duracion(entity.getDuracion())
                .xp(entity.getXp())
                .estadoEnlace(entity.getEstadoEnlace().name())
                .esGratuito(entity.getEsGratuito())
                .ultimaVerificacion(entity.getUltimaVerificacion())
                .build();
    }
}
