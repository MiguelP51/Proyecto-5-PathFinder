package com.pathfinder.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathfinder.dto.ai.MentorInterviewRecommendationsResponseDTO;
import com.pathfinder.dto.response.PerfilEstudianteResponse;
import com.pathfinder.model.entity.Entrevista;
import com.pathfinder.model.entity.ResultadoDISC;
import com.pathfinder.repository.EntrevistaRepository;
import com.pathfinder.repository.ResultadoDISCRepository;
import com.pathfinder.service.PerfilEstudianteService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MentorInterviewAiService {

    private final EntrevistaRepository entrevistaRepository;
    private final ResultadoDISCRepository resultadoDISCRepository;
    private final PerfilEstudianteService perfilEstudianteService;
    private final GeminiAiService geminiAiService;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public MentorInterviewRecommendationsResponseDTO generarRecomendaciones(
            String correoMentor,
            Integer idEntrevista
    ) {
        Entrevista entrevista = entrevistaRepository.findById(idEntrevista)
                .orElseThrow(() -> new IllegalArgumentException("Entrevista no encontrada"));

        if (!entrevista.getMentor().getCorreo().equals(correoMentor)) {
            throw new SecurityException("No tienes permisos para generar recomendaciones de esta entrevista");
        }

        PerfilEstudianteResponse perfil = perfilEstudianteService.obtenerPerfil(
                entrevista.getEstudiante().getCorreo()
        );

        ResultadoDISC disc = resultadoDISCRepository
                .findFirstByUsuario_IdUsuarioOrderByFechaFinalizacionDesc(
                        entrevista.getEstudiante().getIdUsuario()
                )
                .orElse(null);

        List<AvailableSkillPath> skillPathsDisponibles = obtenerSkillPathsDisponibles();

        String prompt = buildPrompt(entrevista, perfil, disc, skillPathsDisponibles);
        MentorInterviewRecommendationsResponseDTO response = geminiAiService.generateJson(
                prompt,
                MentorInterviewRecommendationsResponseDTO.class
        );

        return validarSkillPathsRecomendados(response, skillPathsDisponibles);
    }

    private String buildPrompt(
            Entrevista entrevista,
            PerfilEstudianteResponse perfil,
            ResultadoDISC disc,
            List<AvailableSkillPath> skillPathsDisponibles
    ) {
        Map<String, Object> contexto = new LinkedHashMap<>();
        contexto.put("puestoEntrevista", clean(entrevista.getPuesto()));
        contexto.put("tipoEntrevista", clean(entrevista.getTipo()));
        contexto.put("perfilProfesional", perfil.getPerfilProfesional());
        contexto.put("interesesProfesionales", perfil.getInteresesProfesionales());
        contexto.put("objetivosLaborales", perfil.getObjetivosLaborales());
        contexto.put("formaciones", perfil.getFormaciones());
        contexto.put("experiencias", perfil.getExperiencias());
        contexto.put("habilidades", perfil.getHabilidades());
        contexto.put("idiomas", perfil.getIdiomas());
        contexto.put("herramientas", perfil.getHerramientas());
        contexto.put("disc", disc == null ? null : Map.of(
                "perfilDominante", disc.getPerfilDominante(),
                "puntajeD", disc.getPuntajeD(),
                "puntajeI", disc.getPuntajeI(),
                "puntajeS", disc.getPuntajeS(),
                "puntajeC", disc.getPuntajeC()
        ));
        contexto.put("skillpathsDisponibles", skillPathsDisponibles.stream()
                .map(this::mapSkillPath)
                .toList());

        return """
                Eres un asistente de apoyo para PathMentors en PathFinder.

                Tu tarea es ayudar al mentor a preparar una entrevista con un estudiante universitario peruano.

                Reglas obligatorias:
                - Responde en espanol profesional, breve y accionable.
                - No reemplazas al mentor; solo generas recomendaciones revisables.
                - No inventes experiencia, estudios, habilidades, logros ni SkillPaths.
                - Solo puedes recomendar SkillPaths incluidos en skillpathsDisponibles.
                - Si recomiendas un SkillPath, devuelve exactamente su idSkillPath.
                - No uses lenguaje de aprobado/desaprobado.
                - No incluyas datos personales de contacto.
                - Maximo 3 tipsCv, 3 skillpathsRecomendados, 4 preguntasSugeridas y 3 puntosAValidar.
                - Devuelve exclusivamente JSON valido con esta estructura:
                {
                  "resumenEstudiante": "texto breve",
                  "tipsCv": ["texto"],
                  "skillpathsRecomendados": [
                    {
                      "idSkillPath": 1,
                      "titulo": "texto",
                      "prioridad": "ALTA|MEDIA|BAJA",
                      "motivo": "texto"
                    }
                  ],
                  "preguntasSugeridas": [
                    {
                      "tipo": "CV|Conductual|Tecnica|DISC",
                      "pregunta": "texto",
                      "objetivo": "texto"
                    }
                  ],
                  "puntosAValidar": ["texto"]
                }

                Contexto en JSON:
                %s
                """.formatted(toJson(contexto));
    }

    private List<AvailableSkillPath> obtenerSkillPathsDisponibles() {
        return jdbcTemplate.query("""
                SELECT id_skill_path, titulo, area_nombre, subarea_nombre,
                       dificultad, duracion_label, descripcion
                FROM skill_path
                WHERE id_usuario IS NULL
                  AND activo = true
                ORDER BY id_skill_path
                LIMIT 30
                """, (rs, rowNum) -> new AvailableSkillPath(
                rs.getInt("id_skill_path"),
                rs.getString("titulo"),
                rs.getString("area_nombre"),
                rs.getString("subarea_nombre"),
                rs.getString("dificultad"),
                rs.getString("duracion_label"),
                rs.getString("descripcion")
        ));
    }

    private Map<String, Object> mapSkillPath(AvailableSkillPath skillPath) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("idSkillPath", skillPath.idSkillPath());
        item.put("titulo", skillPath.titulo());
        item.put("area", skillPath.areaNombre());
        item.put("subarea", skillPath.subareaNombre());
        item.put("dificultad", skillPath.dificultad());
        item.put("duracion", skillPath.duracionLabel());
        item.put("descripcion", skillPath.descripcion());
        return item;
    }

    private MentorInterviewRecommendationsResponseDTO validarSkillPathsRecomendados(
            MentorInterviewRecommendationsResponseDTO response,
            List<AvailableSkillPath> skillPathsDisponibles
    ) {
        if (response == null) {
            return new MentorInterviewRecommendationsResponseDTO();
        }

        if (response.getSkillpathsRecomendados() == null) {
            response.setSkillpathsRecomendados(new ArrayList<>());
        }
        if (response.getTipsCv() == null) {
            response.setTipsCv(new ArrayList<>());
        }
        if (response.getPreguntasSugeridas() == null) {
            response.setPreguntasSugeridas(new ArrayList<>());
        }
        if (response.getPuntosAValidar() == null) {
            response.setPuntosAValidar(new ArrayList<>());
        }

        Map<Integer, AvailableSkillPath> disponiblesPorId = skillPathsDisponibles.stream()
                .collect(Collectors.toMap(AvailableSkillPath::idSkillPath, Function.identity()));

        List<MentorInterviewRecommendationsResponseDTO.SkillPathRecommendationDTO> filtrados =
                response.getSkillpathsRecomendados().stream()
                        .filter(Objects::nonNull)
                        .filter(item -> item.getIdSkillPath() != null)
                        .filter(item -> disponiblesPorId.containsKey(item.getIdSkillPath()))
                        .peek(item -> {
                            AvailableSkillPath real = disponiblesPorId.get(item.getIdSkillPath());
                            item.setTitulo(real.titulo());
                        })
                        .toList();

        response.setSkillpathsRecomendados(filtrados);
        return response;
    }

    private String toJson(Map<String, Object> context) {
        try {
            return objectMapper.writeValueAsString(context);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("No se pudo preparar el contexto para IA", e);
        }
    }

    private String clean(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private record AvailableSkillPath(
            Integer idSkillPath,
            String titulo,
            String areaNombre,
            String subareaNombre,
            String dificultad,
            String duracionLabel,
            String descripcion
    ) {
    }
}
