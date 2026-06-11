package com.pathfinder.dto.request;

import jakarta.validation.Valid;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class MentorProfileRequest {

    private String titulo;
    private String telefono;
    private String ubicacion;
    private String linkedinUrl;
    private String bio;
    @Valid
    private List<AreaExpertiseRequest> areasExpertise = new ArrayList<>();

    @Valid
    private List<CertificacionRequest> certificaciones = new ArrayList<>();

    @Valid
    private List<EspecialidadRequest> especialidades = new ArrayList<>();

    @Data
    public static class AreaExpertiseRequest {
        private Integer id;
        private String nombre;
        private Integer aniosExperiencia;
    }

    @Data
    public static class CertificacionRequest {
        private Integer id;
        private String titulo;
        private String emisor;
        private String anio;
    }

    @Data
    public static class EspecialidadRequest {
        private Integer id;
        private String nombre;
    }
}
