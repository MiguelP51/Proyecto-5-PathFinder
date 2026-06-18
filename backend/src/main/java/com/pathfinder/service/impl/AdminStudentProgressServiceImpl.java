package com.pathfinder.service.impl;

import com.pathfinder.dto.admin.progress.AdminStudentProgressSummaryDTO;
import com.pathfinder.dto.admin.progress.AdminStudentSkillPathProgressDTO;
import com.pathfinder.dto.admin.progress.AdminStudentSubAreaProgressDTO;
import com.pathfinder.model.entity.DiagnosticoInicial;
import com.pathfinder.model.entity.SkillPath;
import com.pathfinder.model.entity.SubArea;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.entity.UsuarioSkillPath;
import com.pathfinder.model.enums.RolUsuario;
import com.pathfinder.repository.DiagnosticoInicialRepository;
import com.pathfinder.repository.SkillPathRepository;
import com.pathfinder.repository.SubAreaRepository;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.repository.UsuarioSkillPathRepository;
import com.pathfinder.repository.VisitaSubAreaRepository;
import com.pathfinder.service.AdminStudentProgressService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminStudentProgressServiceImpl implements AdminStudentProgressService {

    private static final Set<String> ESTADOS_COMPLETADOS = Set.of("COMPLETADO", "VALIDADO");
    private static final Set<String> ESTADOS_EN_PROGRESO = Set.of(
            "EN_PROGRESO",
            "CERTIFICADO_PENDIENTE",
            "VALIDACION_PENDIENTE"
    );

    private final UsuarioRepository usuarioRepository;
    private final UsuarioSkillPathRepository usuarioSkillPathRepository;
    private final SubAreaRepository subAreaRepository;
    private final SkillPathRepository skillPathRepository;
    private final VisitaSubAreaRepository visitaSubAreaRepository;
    private final DiagnosticoInicialRepository diagnosticoInicialRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AdminStudentProgressSummaryDTO> listarResumenEstudiantes() {
        return usuarioRepository.findByRolAndActivoTrue(RolUsuario.USER).stream()
                .map(this::toResumenDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminStudentSkillPathProgressDTO> listarSkillPathsEstudiante(Integer idUsuario) {
        buscarUsuario(idUsuario);

        return usuarioSkillPathRepository.findByUsuarioIdWithSkillPath(idUsuario).stream()
                .map(this::toSkillPathDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminStudentSubAreaProgressDTO> listarSubAreasEstudiante(Integer idUsuario) {
        buscarUsuario(idUsuario);

        List<UsuarioSkillPath> avances = usuarioSkillPathRepository.findByUsuarioIdWithSkillPath(idUsuario);
        Map<String, List<UsuarioSkillPath>> avancesPorSubarea = avances.stream()
                .filter(avance -> avance.getSkillPath() != null)
                .filter(avance -> StringUtils.hasText(avance.getSkillPath().getSubareaId()))
                .collect(Collectors.groupingBy(avance -> avance.getSkillPath().getSubareaId()));

        Map<String, Long> totalSkillPathsPorSubarea = skillPathRepository.findByUsuarioIsNullAndActivoTrue().stream()
                .filter(skillPath -> StringUtils.hasText(skillPath.getSubareaId()))
                .collect(Collectors.groupingBy(SkillPath::getSubareaId, Collectors.counting()));

        return subAreaRepository.findByActivoTrue().stream()
                .sorted(Comparator
                        .comparing(SubArea::getAreaNombre, Comparator.nullsLast(String::compareToIgnoreCase))
                        .thenComparing(SubArea::getNombre, Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(subArea -> toSubAreaDTO(
                        idUsuario,
                        subArea,
                        avancesPorSubarea.getOrDefault(subArea.getSlug(), List.of()),
                        totalSkillPathsPorSubarea.getOrDefault(subArea.getSlug(), 0L).intValue()
                ))
                .toList();
    }

    private AdminStudentProgressSummaryDTO toResumenDTO(Usuario usuario) {
        List<UsuarioSkillPath> avances = usuarioSkillPathRepository
                .findByUsuarioIdWithSkillPath(usuario.getIdUsuario());

        int totalIniciados = avances.size();
        int completados = (int) avances.stream().filter(this::estaCompletado).count();
        int enProgreso = (int) avances.stream().filter(this::estaEnProgreso).count();

        return AdminStudentProgressSummaryDTO.builder()
                .idUsuario(usuario.getIdUsuario())
                .nombre(usuario.getNombreCompleto())
                .correo(usuario.getCorreo())
                .rol(usuario.getRol() != null ? usuario.getRol().name() : null)
                .progresoGeneralSkillPaths(calcularPromedio(avances))
                .totalSkillPathsIniciados(totalIniciados)
                .skillPathsCompletados(completados)
                .skillPathsEnProgreso(enProgreso)
                .totalChallenges(0)
                .challengesCompletados(0)
                .build();
    }

    private AdminStudentSkillPathProgressDTO toSkillPathDTO(UsuarioSkillPath avance) {
        SkillPath skillPath = avance.getSkillPath();

        return AdminStudentSkillPathProgressDTO.builder()
                .idSkillPath(skillPath.getIdSkillPath())
                .titulo(skillPath.getTitulo())
                .plataforma(skillPath.getPlataforma())
                .areaId(skillPath.getAreaId())
                .areaNombre(skillPath.getAreaNombre())
                .subareaId(skillPath.getSubareaId())
                .subareaNombre(skillPath.getSubareaNombre())
                .estado(avance.getEstado())
                .progreso(valorProgreso(avance))
                .xp(skillPath.getXp())
                .fechaInicio(avance.getFechaInicio())
                .fechaCompletado(avance.getFechaCompletado())
                .fechaValidacion(avance.getFechaValidacion())
                .build();
    }

    private AdminStudentSubAreaProgressDTO toSubAreaDTO(
            Integer idUsuario,
            SubArea subArea,
            List<UsuarioSkillPath> avances,
            Integer totalSkillPaths
    ) {
        DiagnosticoInicial diagnostico = diagnosticoInicialRepository
                .findTopByUsuario_IdUsuarioAndSubArea_IdSubareaOrderByFechaInicioDesc(
                        idUsuario,
                        subArea.getIdSubarea()
                )
                .orElse(null);

        boolean yaVisitada = visitaSubAreaRepository
                .findByUsuario_IdUsuarioAndSubArea_IdSubarea(idUsuario, subArea.getIdSubarea())
                .isPresent();

        return AdminStudentSubAreaProgressDTO.builder()
                .idSubarea(subArea.getIdSubarea())
                .slug(subArea.getSlug())
                .nombre(subArea.getNombre())
                .areaId(subArea.getAreaId())
                .areaNombre(subArea.getAreaNombre())
                .areaEmoji(subArea.getAreaEmoji())
                .yaVisitada(yaVisitada)
                .diagnosticoEstado(diagnostico != null ? diagnostico.getEstado() : null)
                .diagnosticoPuntaje(diagnostico != null ? diagnostico.getPuntaje() : null)
                .totalSkillPaths(totalSkillPaths)
                .skillPathsIniciados(avances.size())
                .skillPathsCompletados((int) avances.stream().filter(this::estaCompletado).count())
                .progresoPromedioSkillPaths(calcularPromedio(avances))
                .build();
    }

    private Usuario buscarUsuario(Integer idUsuario) {
        return usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + idUsuario));
    }

    private int calcularPromedio(List<UsuarioSkillPath> avances) {
        if (avances.isEmpty()) {
            return 0;
        }

        return (int) Math.round(
                avances.stream()
                        .mapToInt(this::valorProgreso)
                        .average()
                        .orElse(0)
        );
    }

    private int valorProgreso(UsuarioSkillPath avance) {
        return avance.getProgreso() != null ? avance.getProgreso() : 0;
    }

    private boolean estaCompletado(UsuarioSkillPath avance) {
        String estado = avance.getEstado();
        return estado != null && ESTADOS_COMPLETADOS.contains(estado.toUpperCase());
    }

    private boolean estaEnProgreso(UsuarioSkillPath avance) {
        String estado = avance.getEstado();
        if (estado != null && ESTADOS_EN_PROGRESO.contains(estado.toUpperCase())) {
            return true;
        }

        int progreso = valorProgreso(avance);
        return progreso > 0 && progreso < 100 && !estaCompletado(avance);
    }
}
