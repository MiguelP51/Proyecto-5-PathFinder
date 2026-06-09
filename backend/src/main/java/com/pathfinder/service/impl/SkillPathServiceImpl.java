package com.pathfinder.service.impl;

import com.pathfinder.dto.response.SkillPathEstudianteResponseDTO;
import com.pathfinder.model.entity.SkillPath;
import com.pathfinder.model.entity.UsuarioSkillPath;
import com.pathfinder.repository.SkillPathRepository;
import com.pathfinder.repository.UsuarioSkillPathRepository;
import com.pathfinder.service.SkillPathService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillPathServiceImpl implements SkillPathService {

    private final SkillPathRepository skillPathRepository;
    private final UsuarioSkillPathRepository usuarioSkillPathRepository;

    @Override
    public List<SkillPathEstudianteResponseDTO> listarSkillPathsEstudiante(
            String correo,
            String subareaId
    ) {
        List<SkillPath> skillPaths;

        if (StringUtils.hasText(subareaId)) {
            skillPaths = skillPathRepository.findByUsuarioIsNullAndSubareaIdAndActivoTrue(
                    subareaId
            );
        } else {
            skillPaths = skillPathRepository.findByUsuarioIsNullAndActivoTrue();
        }

        List<Integer> idsSkillPath = skillPaths.stream()
                .map(SkillPath::getIdSkillPath)
                .toList();

        Map<Integer, UsuarioSkillPath> progresoPorSkillPath =
                usuarioSkillPathRepository
                        .findByUsuario_CorreoAndSkillPath_IdSkillPathIn(
                                correo,
                                idsSkillPath
                        )
                        .stream()
                        .collect(Collectors.toMap(
                                usuarioSkillPath -> usuarioSkillPath.getSkillPath().getIdSkillPath(),
                                Function.identity()
                        ));

        return skillPaths.stream()
                .map(skillPath -> mapToSkillPathEstudianteResponse(
                        skillPath,
                        progresoPorSkillPath.get(skillPath.getIdSkillPath())
                ))
                .toList();
    }

    @Override
    public SkillPathEstudianteResponseDTO obtenerSkillPathEstudiantePorId(
            String correo,
            Integer idSkillPath
    ) {
        SkillPath skillPath = skillPathRepository
                .findByIdSkillPathAndUsuarioIsNullAndActivoTrue(idSkillPath)
                .orElseThrow(() -> new IllegalArgumentException(
                        "SkillPath no encontrado o no está disponible"
                ));

        UsuarioSkillPath usuarioSkillPath = usuarioSkillPathRepository
                .findByUsuario_CorreoAndSkillPath_IdSkillPath(
                        correo,
                        idSkillPath
                )
                .orElse(null);

        return mapToSkillPathEstudianteResponse(skillPath, usuarioSkillPath);
    }

    private SkillPathEstudianteResponseDTO mapToSkillPathEstudianteResponse(
            SkillPath skillPath,
            UsuarioSkillPath usuarioSkillPath
    ) {
        String estado = usuarioSkillPath != null
                ? usuarioSkillPath.getEstado()
                : "DISPONIBLE";

        Integer progreso = usuarioSkillPath != null
                ? usuarioSkillPath.getProgreso()
                : 0;

        return SkillPathEstudianteResponseDTO.builder()
                .id(String.valueOf(skillPath.getIdSkillPath()))

                .areaId(skillPath.getAreaId())
                .areaName(skillPath.getAreaNombre())

                .subareaId(skillPath.getSubareaId())
                .subareaName(skillPath.getSubareaNombre())

                .title(skillPath.getTitulo())
                .platform(skillPath.getPlataforma())
                .description(skillPath.getDescripcion())

                .difficulty(valorPorDefecto(skillPath.getDificultad(), "BASICO"))
                .durationLabel(valorPorDefecto(skillPath.getDuracionLabel(), "Sin duración"))
                .xp(valorPorDefecto(skillPath.getXp(), 0))

                .progressPercentage(valorPorDefecto(progreso, 0))
                .status(valorPorDefecto(estado, "DISPONIBLE"))

                .skills(Collections.emptyList())

                .externalUrl(skillPath.getUrlExterno())
                .isRecommended(Boolean.TRUE.equals(skillPath.getEsRecomendado()))

                .evidence(null)
                .reward(null)

                .build();
    }

    private String valorPorDefecto(String valor, String defecto) {
        return StringUtils.hasText(valor) ? valor : defecto;
    }

    private Integer valorPorDefecto(Integer valor, Integer defecto) {
        return valor != null ? valor : defecto;
    }
}