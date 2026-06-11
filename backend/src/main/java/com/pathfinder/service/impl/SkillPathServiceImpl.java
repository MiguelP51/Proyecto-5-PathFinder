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
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import com.pathfinder.model.entity.EvidenciaSkillPath;
import com.pathfinder.repository.EvidenciaSkillPathRepository;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.time.LocalDateTime;

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
    private final UsuarioRepository usuarioRepository;
    private final EvidenciaSkillPathRepository evidenciaSkillPathRepository;

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
                        progresoPorSkillPath.get(skillPath.getIdSkillPath()),
                        null
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

        EvidenciaSkillPath evidencia = null;

        if (usuarioSkillPath != null) {
            evidencia = evidenciaSkillPathRepository
                    .findTopByUsuarioSkillPath_IdUsuarioSkillPathOrderByFechaSubidaDesc(
                            usuarioSkillPath.getIdUsuarioSkillPath()
                    )
                    .orElse(null);
        }

        return mapToSkillPathEstudianteResponse(
                skillPath,
                usuarioSkillPath,
                evidencia
        );
    }

    private SkillPathEstudianteResponseDTO mapToSkillPathEstudianteResponse(
            SkillPath skillPath,
            UsuarioSkillPath usuarioSkillPath,
            EvidenciaSkillPath evidencia
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

                .evidence(mapToEvidenceDTO(evidencia))
                .reward(null)

                .build();
    }

    private SkillPathEstudianteResponseDTO.SkillPathEvidenceDTO mapToEvidenceDTO(
            EvidenciaSkillPath evidencia
    ) {
        if (evidencia == null) {
            return null;
        }

        return SkillPathEstudianteResponseDTO.SkillPathEvidenceDTO.builder()
                .id(String.valueOf(evidencia.getIdEvidenciaSkillPath()))
                .fileName(evidencia.getNombreArchivo())
                .fileUrl(null)
                .status(evidencia.getEstadoValidacion())
                .uploadedAt(evidencia.getFechaSubida() != null
                        ? evidencia.getFechaSubida().toLocalDate().toString()
                        : null)
                .reviewedAt(evidencia.getFechaRevision() != null
                        ? evidencia.getFechaRevision().toLocalDate().toString()
                        : null)
                .reviewerComment(evidencia.getComentarioRevision())
                .build();
    }

    @Override
    @Transactional
    public SkillPathEstudianteResponseDTO iniciarSkillPathEstudiante(
            String correo,
            Integer idSkillPath
    ) {
        SkillPath skillPath = skillPathRepository
                .findByIdSkillPathAndUsuarioIsNullAndActivoTrue(idSkillPath)
                .orElseThrow(() -> new IllegalArgumentException(
                        "SkillPath no encontrado o no está disponible"
                ));

        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuario no encontrado"
                ));

        UsuarioSkillPath usuarioSkillPath = usuarioSkillPathRepository
                .findByUsuario_CorreoAndSkillPath_IdSkillPath(
                        correo,
                        idSkillPath
                )
                .orElseGet(() -> {
                    UsuarioSkillPath nuevo = new UsuarioSkillPath();
                    nuevo.setUsuario(usuario);
                    nuevo.setSkillPath(skillPath);
                    nuevo.setEstado("EN_PROGRESO");
                    nuevo.setProgreso(0);
                    nuevo.setFechaInicio(LocalDateTime.now());
                    nuevo.setFechaRegistro(LocalDateTime.now());
                    return nuevo;
                });

        if ("DISPONIBLE".equals(usuarioSkillPath.getEstado())) {
            usuarioSkillPath.setEstado("EN_PROGRESO");
            usuarioSkillPath.setFechaInicio(LocalDateTime.now());
        }

        UsuarioSkillPath avanceGuardado =
                usuarioSkillPathRepository.save(usuarioSkillPath);

        return mapToSkillPathEstudianteResponse(
                skillPath,
                avanceGuardado,
                null
        );
    }

    @Override
    @Transactional
    public SkillPathEstudianteResponseDTO subirEvidenciaSkillPath(
            String correo,
            Integer idSkillPath,
            MultipartFile file
    ) {
        validarArchivoEvidencia(file);

        SkillPath skillPath = skillPathRepository
                .findByIdSkillPathAndUsuarioIsNullAndActivoTrue(idSkillPath)
                .orElseThrow(() -> new IllegalArgumentException(
                        "SkillPath no encontrado o no está disponible"
                ));

        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuario no encontrado"
                ));

        UsuarioSkillPath usuarioSkillPath = usuarioSkillPathRepository
                .findByUsuario_CorreoAndSkillPath_IdSkillPath(correo, idSkillPath)
                .orElseGet(() -> {
                    UsuarioSkillPath nuevo = new UsuarioSkillPath();
                    nuevo.setUsuario(usuario);
                    nuevo.setSkillPath(skillPath);
                    nuevo.setEstado("EN_PROGRESO");
                    nuevo.setProgreso(0);
                    nuevo.setFechaInicio(LocalDateTime.now());
                    nuevo.setFechaRegistro(LocalDateTime.now());
                    return nuevo;
                });

        if ("VALIDADO".equals(usuarioSkillPath.getEstado())
                || "COMPLETADO".equals(usuarioSkillPath.getEstado())) {
            throw new IllegalArgumentException(
                    "Este SkillPath ya fue validado. No se puede modificar la evidencia."
            );
        }

        usuarioSkillPath.setEstado("VALIDACION_PENDIENTE");
        usuarioSkillPath.setFechaModificacion(LocalDateTime.now());

        UsuarioSkillPath avanceGuardado =
                usuarioSkillPathRepository.save(usuarioSkillPath);

        evidenciaSkillPathRepository.deleteByUsuarioSkillPath_IdUsuarioSkillPath(
                avanceGuardado.getIdUsuarioSkillPath()
        );

        EvidenciaSkillPath evidencia = new EvidenciaSkillPath();
        evidencia.setUsuarioSkillPath(avanceGuardado);
        evidencia.setNombreArchivo(file.getOriginalFilename());
        evidencia.setContentType(file.getContentType());
        evidencia.setTamanioBytes(file.getSize());
        evidencia.setEstadoValidacion("PENDIENTE");
        evidencia.setFechaSubida(LocalDateTime.now());

        try {
            evidencia.setArchivo(file.getBytes());
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo leer el archivo enviado", e);
        }

        EvidenciaSkillPath evidenciaGuardada =
                evidenciaSkillPathRepository.save(evidencia);

        return mapToSkillPathEstudianteResponse(
                skillPath,
                avanceGuardado,
                evidenciaGuardada
        );
    }

    @Override
    @Transactional
    public SkillPathEstudianteResponseDTO eliminarEvidenciaSkillPath(
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
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe un avance registrado para este SkillPath."
                ));

        if ("VALIDADO".equals(usuarioSkillPath.getEstado())
                || "COMPLETADO".equals(usuarioSkillPath.getEstado())) {
            throw new IllegalArgumentException(
                    "Este SkillPath ya fue validado. No se puede eliminar la evidencia."
            );
        }

        evidenciaSkillPathRepository.deleteByUsuarioSkillPath_IdUsuarioSkillPath(
                usuarioSkillPath.getIdUsuarioSkillPath()
        );

        usuarioSkillPath.setEstado("EN_PROGRESO");
        usuarioSkillPath.setFechaModificacion(LocalDateTime.now());

        UsuarioSkillPath avanceGuardado =
                usuarioSkillPathRepository.save(usuarioSkillPath);

        return mapToSkillPathEstudianteResponse(
                skillPath,
                avanceGuardado,
                null
        );
    }

    private void validarArchivoEvidencia(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Debe seleccionar un archivo PDF.");
        }

        long maxSizeBytes = 10L * 1024L * 1024L;

        if (file.getSize() > maxSizeBytes) {
            throw new IllegalArgumentException("El archivo no debe superar los 10 MB.");
        }

        String fileName = file.getOriginalFilename();
        String contentType = file.getContentType();

        boolean esPdfPorNombre = fileName != null
                && fileName.toLowerCase().endsWith(".pdf");

        boolean esPdfPorTipo = "application/pdf".equalsIgnoreCase(contentType);

        if (!esPdfPorNombre && !esPdfPorTipo) {
            throw new IllegalArgumentException("Solo se permiten archivos PDF.");
        }
    }

    private String valorPorDefecto(String valor, String defecto) {
        return StringUtils.hasText(valor) ? valor : defecto;
    }

    private Integer valorPorDefecto(Integer valor, Integer defecto) {
        return valor != null ? valor : defecto;
    }
}