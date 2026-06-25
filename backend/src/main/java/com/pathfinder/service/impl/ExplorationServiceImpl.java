// backend/src/main/java/com/pathfinder/service/impl/ExplorationServiceImpl.java
package com.pathfinder.service.impl;

import com.pathfinder.dto.response.SubAreaResponseDTO;
import com.pathfinder.model.entity.DiagnosticoInicial;
import com.pathfinder.model.entity.PathChallenge;
import com.pathfinder.model.entity.SkillPath;
import com.pathfinder.model.entity.SubArea;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.entity.UsuarioPathChallenge;
import com.pathfinder.model.entity.UsuarioSkillPath;
import com.pathfinder.model.entity.VisitaSubArea;
import com.pathfinder.repository.DiagnosticoInicialRepository;
import com.pathfinder.repository.PathChallengeRepository;
import com.pathfinder.repository.SkillPathRepository;
import com.pathfinder.repository.SubAreaRepository;
import com.pathfinder.repository.UsuarioPathChallengeRepository;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.repository.UsuarioSkillPathRepository;
import com.pathfinder.repository.VisitaSubAreaRepository;
import com.pathfinder.service.ExplorationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static java.util.stream.Collectors.toMap;

@Service
@RequiredArgsConstructor
public class ExplorationServiceImpl implements ExplorationService {

    private final SubAreaRepository subAreaRepository;
    private final VisitaSubAreaRepository visitaSubAreaRepository;
    private final UsuarioRepository usuarioRepository;
    private final DiagnosticoInicialRepository diagnosticoInicialRepository;
    private final SkillPathRepository skillPathRepository;
    private final UsuarioSkillPathRepository usuarioSkillPathRepository;
    private final PathChallengeRepository pathChallengeRepository;
    private final UsuarioPathChallengeRepository usuarioPathChallengeRepository;

    @Override
    public List<SubAreaResponseDTO> getSubAreasByArea(String areaId, Integer idUsuario) {
        Usuario usuario = obtenerUsuario(idUsuario);

        return subAreaRepository.findByAreaIdAndActivoTrue(areaId).stream()
                .map(sa -> toDTO(sa, usuario))
                .toList();
    }

    @Override
    public SubAreaResponseDTO getSubAreaDetalle(Integer idSubarea, Integer idUsuario) {
        Usuario usuario = obtenerUsuario(idUsuario);

        SubArea subArea = subAreaRepository.findByIdSubareaAndActivoTrue(idSubarea)
                .orElseThrow(() -> new EntityNotFoundException("SubArea no encontrada"));
        return toDTO(subArea, usuario);
    }

    @Override
    @Transactional
    public void registrarVisita(Integer idSubarea, Integer idUsuario) {
        boolean yaVisitada = visitaSubAreaRepository
                .findByUsuario_IdUsuarioAndSubArea_IdSubarea(idUsuario, idSubarea)
                .isPresent();

        if (!yaVisitada) {
            SubArea subArea = subAreaRepository.findById(idSubarea)
                    .orElseThrow(() -> new EntityNotFoundException("SubArea no encontrada"));
            Usuario usuario = usuarioRepository.findById(idUsuario)
                    .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

            VisitaSubArea visita = new VisitaSubArea();
            visita.setUsuario(usuario);
            visita.setSubArea(subArea);
            visita.setFechaPrimerAcceso(LocalDateTime.now());
            visitaSubAreaRepository.save(visita);
        }
    }

    private Usuario obtenerUsuario(Integer idUsuario) {
        return usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
    }

    private SubAreaResponseDTO toDTO(SubArea sa, Usuario usuario) {
        Integer idUsuario = usuario.getIdUsuario();

        boolean yaVisitada = visitaSubAreaRepository
                .findByUsuario_IdUsuarioAndSubArea_IdSubarea(idUsuario, sa.getIdSubarea())
                .isPresent();

        // Una sola consulta deriva ambos flags de diagnóstico:
        // - diagnosticoIniciado: existe un DiagnosticoInicial, sin importar su estado (EN_PROGRESO o COMPLETADO)
        // - diagnosticoCompletado: ese último diagnóstico tiene estado COMPLETADO
        Optional<DiagnosticoInicial> ultimoDiagnostico = diagnosticoInicialRepository
                .findTopByUsuario_IdUsuarioAndSubArea_IdSubareaOrderByFechaInicioDesc(idUsuario, sa.getIdSubarea());

        boolean diagnosticoIniciado = ultimoDiagnostico.isPresent();
        boolean diagnosticoCompletado = ultimoDiagnostico
                .map(d -> "COMPLETADO".equalsIgnoreCase(d.getEstado()))
                .orElse(false);

        return SubAreaResponseDTO.builder()
                .idSubarea(sa.getIdSubarea())
                .areaId(sa.getAreaId())
                .areaNombre(sa.getAreaNombre())
                .areaEmoji(sa.getAreaEmoji())
                .nombre(sa.getNombre())
                .emoji(sa.getEmoji())
                .descripcion(sa.getDescripcion())
                .objetivos(sa.getObjetivos())
                .habilidadesRelacionadas(sa.getHabilidadesRelacionadas())
                .nivel(sa.getNivel())
                .cantidadSkillPaths(sa.getCantidadSkillPaths())
                .cantidadPathChallenges(sa.getCantidadPathChallenges())
                .plataformasSkillPath(sa.getPlataformasSkillPath())
                .slug(sa.getSlug())
                .yaVisitada(yaVisitada)
                .diagnosticoIniciado(diagnosticoIniciado)
                .diagnosticoCompletado(diagnosticoCompletado)
                .progreso(calcularProgresoCombinado(sa, usuario))
                .build();
    }

    /**
     * HU-EST-21: progreso combinado de la subárea = promedio simple entre
     * el progreso de todos los SkillPaths del catálogo de la subárea y el
     * de todos los PathChallenges publicados de la subárea, usando el avance
     * real del estudiante en cada ítem (0 si todavía no lo inició).
     * Devuelve null si la subárea no tiene ningún SkillPath ni PathChallenge
     * configurado todavía (nada que medir, distinto de "0% de avance").
     */
    private Integer calcularProgresoCombinado(SubArea sa, Usuario usuario) {
        List<SkillPath> skillPathsCatalogo = sa.getSlug() != null
                ? skillPathRepository.findByUsuarioIsNullAndSubareaIdAndActivoTrue(sa.getSlug())
                : List.of();

        List<PathChallenge> challengesCatalogo =
                pathChallengeRepository.findPublicadosBySubAreaWithHabilidades(sa.getIdSubarea());

        int totalItems = skillPathsCatalogo.size() + challengesCatalogo.size();

        if (totalItems == 0) {
            return null;
        }

        Map<Integer, UsuarioSkillPath> avancesSkillPath = skillPathsCatalogo.isEmpty()
                ? Map.of()
                : usuarioSkillPathRepository
                        .findByUsuario_CorreoAndSkillPath_IdSkillPathInAndActivoTrue(
                                usuario.getCorreo(),
                                skillPathsCatalogo.stream().map(SkillPath::getIdSkillPath).toList()
                        )
                        .stream()
                        .collect(toMap(avance -> avance.getSkillPath().getIdSkillPath(), avance -> avance));

        Map<Integer, UsuarioPathChallenge> avancesChallenge = challengesCatalogo.isEmpty()
                ? Map.of()
                : usuarioPathChallengeRepository
                        .findByUsuario_CorreoAndPathChallenge_IdPathChallengeInAndActivoTrue(
                                usuario.getCorreo(),
                                challengesCatalogo.stream().map(PathChallenge::getIdPathChallenge).toList()
                        )
                        .stream()
                        .collect(toMap(avance -> avance.getPathChallenge().getIdPathChallenge(), avance -> avance));

        int sumaProgreso = 0;

        for (SkillPath sp : skillPathsCatalogo) {
            UsuarioSkillPath avance = avancesSkillPath.get(sp.getIdSkillPath());
            sumaProgreso += (avance != null && avance.getProgreso() != null) ? avance.getProgreso() : 0;
        }

        for (PathChallenge pc : challengesCatalogo) {
            UsuarioPathChallenge avance = avancesChallenge.get(pc.getIdPathChallenge());
            sumaProgreso += (avance != null && avance.getProgresoPorcentaje() != null) ? avance.getProgresoPorcentaje() : 0;
        }

        return (int) Math.round(sumaProgreso / (double) totalItems);
    }
}