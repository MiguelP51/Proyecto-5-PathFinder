package com.pathfinder.dto.request;

import com.pathfinder.dto.request.validation.FechaCoherente;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class GuardarPerfilRequest {

    @NotBlank(message = "El nombre completo es obligatorio")
    @Size(max = 150, message = "El nombre no puede superar los 150 caracteres")
    private String nombreCompleto;

    @Email(message = "El correo de contacto no tiene formato válido")
    @Size(max = 150, message = "El correo no puede superar los 150 caracteres")
    private String correoContacto;

    // Perú: 9 dígitos, puede ir con prefijo +51
    @Pattern(
        regexp = "^(\\+51)?[0-9]{9}$",
        message = "El celular debe tener 9 dígitos numéricos (puede incluir +51)"
    )
    private String celular;

    @Size(max = 100, message = "La provincia no puede superar los 100 caracteres")
    private String provincia;

    @Size(max = 100, message = "El distrito no puede superar los 100 caracteres")
    private String distrito;

    @Size(max = 255, message = "La URL de LinkedIn no puede superar los 255 caracteres")
    @Pattern(
        regexp = "^(https?://(www\\.)?linkedin\\.com/.*)?$",
        message = "La URL de LinkedIn no tiene formato válido"
    )
    private String linkedinUrl;

    private String perfilProfesional;
    private String interesesProfesionales;
    private String objetivosLaborales;

    @Valid
    private List<ExperienciaRequest> experiencias = new ArrayList<>();

    @Valid
    private List<FormacionRequest> formaciones = new ArrayList<>();

    @Valid
    private List<HabilidadRequest> habilidades = new ArrayList<>();

    @Valid
    private List<IdiomaRequest> idiomas = new ArrayList<>();

    @Valid
    private List<HerramientaRequest> herramientas = new ArrayList<>();

    // ── Sub-DTOs ──────────────────────────────────────────────────────────────

    @Data
    @FechaCoherente(inicio = "fechaInicio", fin = "fechaFin", activo = "trabajoActual",
                    message = "La fecha de fin debe ser posterior a la de inicio en la experiencia laboral")
    public static class ExperienciaRequest {

        @NotBlank(message = "La empresa es obligatoria en cada experiencia")
        @Size(max = 150, message = "El nombre de empresa no puede superar los 150 caracteres")
        private String empresa;

        @NotBlank(message = "El cargo es obligatorio en cada experiencia")
        @Size(max = 150, message = "El cargo no puede superar los 150 caracteres")
        private String cargo;

        private String funcionesRealizadas;
        private String logrosResultados;

        // Formato esperado: yyyy-MM-dd
        @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$",
                 message = "fechaInicio de experiencia debe tener formato yyyy-MM-dd")
        private String fechaInicio;

        @Pattern(regexp = "^(\\d{4}-\\d{2}-\\d{2})?$",
                 message = "fechaFin de experiencia debe tener formato yyyy-MM-dd")
        private String fechaFin;

        private Boolean trabajoActual;
    }

    @Data
    @FechaCoherente(inicio = "fechaInicio", fin = "fechaFin", activo = "enCurso",
                    message = "La fecha de fin debe ser posterior a la de inicio en la formación académica")
    public static class FormacionRequest {

        @NotBlank(message = "La institución es obligatoria en cada formación")
        @Size(max = 150, message = "La institución no puede superar los 150 caracteres")
        private String institucion;

        @Size(max = 150, message = "La carrera no puede superar los 150 caracteres")
        private String carrera;

        private String cursosRelevantes;

        @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$",
                 message = "fechaInicio de formación debe tener formato yyyy-MM-dd")
        private String fechaInicio;

        @Pattern(regexp = "^(\\d{4}-\\d{2}-\\d{2})?$",
                 message = "fechaFin de formación debe tener formato yyyy-MM-dd")
        private String fechaFin;

        private Boolean enCurso;
    }

    @Data
    public static class HabilidadRequest {

        @NotBlank(message = "El nombre de habilidad es obligatorio")
        @Size(max = 100, message = "El nombre de habilidad no puede superar los 100 caracteres")
        private String nombre;

        // TECNICA | BLANDA — validado en el service, aquí solo protegemos longitud
        @NotBlank(message = "El tipo de habilidad es obligatorio (TECNICA o BLANDA)")
        private String tipo;

        // BASICO | INTERMEDIO | AVANZADO
        @NotBlank(message = "El nivel de habilidad es obligatorio")
        private String nivel;
    }

    @Data
    public static class IdiomaRequest {

        @NotBlank(message = "El nombre del idioma es obligatorio")
        @Size(max = 100, message = "El nombre del idioma no puede superar los 100 caracteres")
        private String nombre;

        @NotBlank(message = "El nivel del idioma es obligatorio")
        private String nivel;
    }

    @Data
    public static class HerramientaRequest {

        @NotBlank(message = "El nombre de la herramienta es obligatorio")
        @Size(max = 100, message = "El nombre de la herramienta no puede superar los 100 caracteres")
        private String nombre;

        @NotBlank(message = "El nivel de la herramienta es obligatorio")
        private String nivel;
    }
}
