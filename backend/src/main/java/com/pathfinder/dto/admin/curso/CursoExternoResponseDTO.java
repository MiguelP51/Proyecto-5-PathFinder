package com.pathfinder.dto.admin.curso;

import com.pathfinder.model.entity.CursoExterno;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CursoExternoResponseDTO {
    private Integer idCurso;

    private Integer idProveedor;
    private String proveedorNombre;

    private Integer idHabilidad;
    private String habilidad;

    private String titulo;
    private String url;
    private String descripcion;
    private String nivel;
    private String duracion;
    private Integer xp;

    private String estadoEnlace;
    private Boolean esGratuito;
    private Boolean activo;
    private String estado;

    private LocalDateTime ultimaVerificacion;

    public static CursoExternoResponseDTO from(CursoExterno entity) {
        return CursoExternoResponseDTO.builder()
                .idCurso(entity.getIdCurso())

                .idProveedor(entity.getProveedor() != null
                        ? entity.getProveedor().getIdProveedor()
                        : null)
                .proveedorNombre(entity.getProveedor() != null
                        ? entity.getProveedor().getNombre()
                        : null)

                .idHabilidad(entity.getHabilidad() != null
                        ? entity.getHabilidad().getIdHabilidad()
                        : null)
                .habilidad(entity.getHabilidad() != null
                        ? entity.getHabilidad().getNombreHabilidad()
                        : null)

                .titulo(entity.getTitulo())
                .url(entity.getUrl())
                .descripcion(entity.getDescripcion())
                .nivel(entity.getNivel() != null ? entity.getNivel().name() : null)
                .duracion(entity.getDuracion())
                .xp(entity.getXp())

                .estadoEnlace(entity.getEstadoEnlace() != null
                        ? entity.getEstadoEnlace().name()
                        : null)
                .esGratuito(entity.getEsGratuito())
                .activo(Boolean.TRUE.equals(entity.getActivo()))
                .estado(Boolean.TRUE.equals(entity.getActivo()) ? "Activo" : "Inactivo")

                .ultimaVerificacion(entity.getUltimaVerificacion())
                .build();
    }
}
