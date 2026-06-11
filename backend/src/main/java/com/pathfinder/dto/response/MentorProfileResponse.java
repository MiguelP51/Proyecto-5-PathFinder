package com.pathfinder.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MentorProfileResponse {

    private Integer idUsuario;
    private String nombreCompleto;
    private String correo;
    private String avatarUrl;

    private String titulo;
    private String telefono;
    private String ubicacion;
    private String linkedinUrl;
    private String bio;
    private List<AreaExpertiseItem> areasExpertise;
    private List<CertificacionItem> certificaciones;
    private List<String> especialidades;

    private MentorMetrics metrics;

    @Data
    @Builder
    public static class AreaExpertiseItem {
        private Integer id;
        private String nombre;
        private Integer aniosExperiencia;
    }

    @Data
    @Builder
    public static class CertificacionItem {
        private Integer id;
        private String titulo;
        private String emisor;
        private String anio;
    }

    @Data
    @Builder
    public static class MentorMetrics {
        private Long totalEntrevistas;
        private Double tasaAprobacion;
        private Double calificacionPromedio;
        private Integer aniosExperiencia;
    }
}
