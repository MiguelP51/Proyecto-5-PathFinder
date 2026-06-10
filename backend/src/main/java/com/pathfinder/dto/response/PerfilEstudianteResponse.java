package com.pathfinder.dto.response;

import com.pathfinder.model.enums.EstadoEtapa;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PerfilEstudianteResponse {

    private Integer        idUsuario;
    private String         nombreCompleto;
    private String         correo;
    private String         avatarUrl;

    private String         correoContacto;
    private String         celular;
    private String         provincia;
    private String         distrito;
    private String         linkedinUrl;
    private String         perfilProfesional;
    private String         interesesProfesionales;
    private String         objetivosLaborales;
    private LocalDateTime  fechaActualizacionCv;

    private List<ExperienciaItem>  experiencias;
    private List<FormacionItem>    formaciones;
    private List<HabilidadItem>    habilidades;
    private List<IdiomaItem>       idiomas;
    private List<HerramientaItem>  herramientas;

    private EstadoEtapa estadoPerfil;
    private boolean     confirmado;

    private String      cvNombreArchivo;
    private boolean     cvUploaded;

    // ── Items — reflejan campos reales de las entidades ──────

    @Data @Builder
    public static class ExperienciaItem {
        private Integer id;              // idExperiencia
        private String  empresa;
        private String  cargo;
        private String  funcionesRealizadas;
        private String  logrosResultados;
        private String  fechaInicio;     // yyyy-MM-dd
        private String  fechaFin;        // yyyy-MM-dd, null si trabajo actual
    }

    @Data @Builder
    public static class FormacionItem {
        private Integer id;              // idFormacion
        private String  institucion;
        private String  carrera;
        private String  cursosRelevantes;
        private String  fechaInicio;     // yyyy-MM-dd
        private String  fechaFin;        // yyyy-MM-dd, null si en curso
    }

    @Data @Builder
    public static class HabilidadItem {
        private Integer id;              // idPerfilCvHabilidad
        private String  nombre;          // nombreHabilidad
        private String  tipo;            // TipoHabilidad.name()
        private String  nivel;           // NivelDominio.name()
    }

    @Data @Builder
    public static class IdiomaItem {
        private Integer id;              // idPerfilCvIdioma
        private String  nombre;          // nombreIdioma
        private String  nivel;           // NivelDominio.name()
    }

    @Data @Builder
    public static class HerramientaItem {
        private Integer id;              // idPerfilCvHerramienta
        private String  nombre;          // nombreHerramienta
        private String  nivel;           // NivelDominio.name()
    }
}
