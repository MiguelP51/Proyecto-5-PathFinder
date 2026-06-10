package com.pathfinder.dto.admin.curso;

import com.pathfinder.model.entity.ProveedorExterno;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProveedorResponseDTO {
    private Integer idProveedor;
    private String nombre;
    private String estadoConexion;
    private LocalDateTime ultimaSincronizacion;
    private Boolean soportaApi;
    private long cursosImportados;

    public static ProveedorResponseDTO from(ProveedorExterno entity, long cursosImportados) {
        return ProveedorResponseDTO.builder()
                .idProveedor(entity.getIdProveedor())
                .nombre(entity.getNombre())
                .estadoConexion(entity.getEstadoConexion().name())
                .ultimaSincronizacion(entity.getUltimaSincronizacion())
                .soportaApi(entity.getSoportaApi())
                .cursosImportados(cursosImportados)
                .build();
    }
}
