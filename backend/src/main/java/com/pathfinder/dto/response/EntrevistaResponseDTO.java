package com.pathfinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntrevistaResponseDTO {
    private Integer idEntrevista;
    private Integer idEstudiante;
    private String estudianteNombre;
    private String estudianteEmail;
    private Integer idMentor;
    private String mentorNombre;
    private String mentorEmail;
    private String fecha; // YYYY-MM-DD
    private String hora; // HH:MM
    private String tipo; // virtual / presencial
    private String estado; // Programada / Completada / Cancelada / Reagendada
    private String virtualLink;
    
    // De etapa de selección
    private String discPerfilDominante;
    private String discNombrePerfil;
    private Boolean cvAvailable;
    
    // De retroalimentación (Feedback)
    private String resultado;
    private String feedbackComentarios;
    private Integer competenciaComunicacion;
    private Integer competenciaTecnica;
    private Integer competenciaProactividad;
    private Integer competenciaResolucion;

    private String motivoCancelacion;
    private Double promedioCalificacion;
    private Map<String, String> nombresCompetencias;
    private String puesto;
    private Boolean emailEnviado;
}

