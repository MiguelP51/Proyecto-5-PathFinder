package com.pathfinder.service.impl;

import com.pathfinder.dto.response.SubAreaResponseDTO;
import com.pathfinder.model.entity.DiagnosticoInicial;
import com.pathfinder.model.entity.SubArea;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.entity.VisitaSubArea;
import com.pathfinder.repository.DiagnosticoInicialRepository;
import com.pathfinder.repository.SubAreaRepository;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.repository.VisitaSubAreaRepository;
import com.pathfinder.service.ExplorationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExplorationServiceImpl implements ExplorationService {

    private final SubAreaRepository subAreaRepository;
    private final VisitaSubAreaRepository visitaSubAreaRepository;
    private final UsuarioRepository usuarioRepository;
    private final DiagnosticoInicialRepository diagnosticoInicialRepository;

    @Override
    public List<SubAreaResponseDTO> getSubAreasByArea(String areaId, Integer idUsuario) {
        return subAreaRepository.findByAreaIdAndActivoTrue(areaId).stream()
                .map(sa -> toDTO(sa, idUsuario))
                .toList();
    }

    @Override
    public SubAreaResponseDTO getSubAreaDetalle(Integer idSubarea, Integer idUsuario) {
        SubArea subArea = subAreaRepository.findByIdSubareaAndActivoTrue(idSubarea)
                .orElseThrow(() -> new EntityNotFoundException("SubArea no encontrada"));
        return toDTO(subArea, idUsuario);
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

    private SubAreaResponseDTO toDTO(SubArea sa, Integer idUsuario) {
        boolean yaVisitada = visitaSubAreaRepository
                .findByUsuario_IdUsuarioAndSubArea_IdSubarea(idUsuario, sa.getIdSubarea())
                .isPresent();

        // Una sola consulta deriva ambos flags de diagnóstico:
        // - diagnosticoIniciado: existe un DiagnosticoInicial, sin importar su estado (EN_PROGRESO o COMPLETADO)
        // - diagnosticoCompletado: ese último diagnóstico tiene estado COMPLETADO
        // Nota: yaVisitada NO se usa para decidir el texto del botón en la lista,
        // porque solo significa "entró a ver la descripción", no "empezó el diagnóstico".
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
                .build();
    }
}