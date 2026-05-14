package com.pathfinder.dto.cv;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO principal que viaja en ambas direcciones:
 *  GET  /api/cv/extract  → backend extrae el PDF y devuelve este DTO al front
 *  PUT  /api/cv/save     → front envía este DTO (ya editado) y backend lo persiste
 */
@Data
public class CVExtractadoDTO {

    // Datos personales / perfil
    private String nombreCompleto;
    private String correoContacto;
    private String celular;
    private String provincia;
    private String distrito;
    private String linkedinUrl;
    private String perfilProfesional;
    private String interesesProfesionales;
    private String objetivosLaborales;

    // Secciones del CV
    private List<ExperienciaLaboralDTO> experiencias   = new ArrayList<>();
    private List<FormacionAcademicaDTO> formaciones    = new ArrayList<>();
    private List<HabilidadDTO>          habilidades    = new ArrayList<>();
    private List<IdiomaDTO>             idiomas        = new ArrayList<>();
    private List<HerramientaDTO>        herramientas   = new ArrayList<>();
}
