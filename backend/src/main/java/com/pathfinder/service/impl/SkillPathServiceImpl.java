package com.pathfinder.service.impl;

import org.springframework.beans.factory.annotation.Value;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import java.io.InputStream;
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

import java.time.LocalDateTime;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.net.URI;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class SkillPathServiceImpl implements SkillPathService {

    private final SkillPathRepository skillPathRepository;
    private final UsuarioSkillPathRepository usuarioSkillPathRepository;
    private final UsuarioRepository usuarioRepository;
    private final EvidenciaSkillPathRepository evidenciaSkillPathRepository;
    private final S3Client s3Client;

    @Value("${aws.bucket-name}")
    private String bucketName;

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
                .fileUrl("/api/skillpaths/estudiante/"
                + evidencia.getUsuarioSkillPath().getSkillPath().getIdSkillPath()
                + "/evidencia/download")
                .validationMethod(evidencia.getMetodoValidacion())
                .verificationUrl(evidencia.getUrlVerificacion())
                .verificationCode(evidencia.getCodigoVerificacion())
                .issuingPlatform(evidencia.getPlataformaEmisora())
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
            MultipartFile file,
            String urlVerificacion
    ) {
        validarArchivoEvidenciaOpcional(file);

        String urlVerificacionLimpia = urlVerificacion != null
                ? urlVerificacion.trim()
                : null;

        boolean tieneArchivo = file != null && !file.isEmpty();
        boolean tieneUrlVerificacion = StringUtils.hasText(urlVerificacionLimpia);

        if (!tieneArchivo && !tieneUrlVerificacion) {
            throw new IllegalArgumentException(
                    "Debes ingresar el enlace de verificación o subir un PDF de respaldo."
            );
        }

        SkillPath skillPath = skillPathRepository
                .findByIdSkillPathAndUsuarioIsNullAndActivoTrue(idSkillPath)
                .orElseThrow(() -> new IllegalArgumentException(
                        "SkillPath no encontrado o no está disponible"
                ));

        String plataformaNormalizada = normalizarPlataforma(skillPath.getPlataforma());

        String codigoVerificacion = null;

        if (requiereUrlVerificable(plataformaNormalizada)) {
            if (!tieneUrlVerificacion) {
                throw new IllegalArgumentException(
                        "Para SkillPaths de " + plataformaNormalizada
                                + ", debes ingresar el enlace oficial del certificado."
                );
            }

            codigoVerificacion = validarUrlCertificado(
                    plataformaNormalizada,
                    urlVerificacionLimpia
            );
        }

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

        eliminarEvidenciasFisicasDeS3(avanceGuardado.getIdUsuarioSkillPath());

        evidenciaSkillPathRepository.deleteByUsuarioSkillPath_IdUsuarioSkillPath(
                avanceGuardado.getIdUsuarioSkillPath()
        );

        String s3Key = null;

        if (tieneArchivo) {
            s3Key = "skillpath-evidencias/usuario_"
                    + usuario.getIdUsuario()
                    + "/skillpath_"
                    + skillPath.getIdSkillPath()
                    + "_"
                    + System.currentTimeMillis()
                    + ".pdf";

            try {
                s3Client.putObject(
                        PutObjectRequest.builder()
                                .bucket(bucketName)
                                .key(s3Key)
                                .contentType("application/pdf")
                                .build(),
                        RequestBody.fromInputStream(file.getInputStream(), file.getSize())
                );
            } catch (Exception e) {
                throw new RuntimeException(
                        "Error al almacenar la evidencia en S3: " + e.getMessage(),
                        e
                );
            }
        }

        EvidenciaSkillPath evidencia = new EvidenciaSkillPath();
        evidencia.setUsuarioSkillPath(avanceGuardado);

        if (tieneArchivo) {
            evidencia.setNombreArchivo(file.getOriginalFilename());
            evidencia.setContentType("application/pdf");
            evidencia.setTamanioBytes(file.getSize());
            evidencia.setRutaArchivo(s3Key);
        }

        evidencia.setPlataformaEmisora(plataformaNormalizada);

        if (tieneUrlVerificacion) {
            evidencia.setMetodoValidacion("URL_OFICIAL");
            evidencia.setUrlVerificacion(urlVerificacionLimpia);
            evidencia.setCodigoVerificacion(codigoVerificacion);
        } else {
            evidencia.setMetodoValidacion("PDF");
        }

        evidencia.setEstadoValidacion("PENDIENTE");
        evidencia.setFechaSubida(LocalDateTime.now());

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

        eliminarEvidenciasFisicasDeS3(usuarioSkillPath.getIdUsuarioSkillPath());

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

    private void validarArchivoEvidenciaOpcional(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return;
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

    private String normalizarPlataforma(String plataforma) {
        if (!StringUtils.hasText(plataforma)) {
            return "DESCONOCIDA";
        }

        String valor = plataforma.trim().toUpperCase(Locale.ROOT);

        if (valor.contains("COURSERA")) {
            return "COURSERA";
        }

        if (valor.contains("UDEMY")) {
            return "UDEMY";
        }

        return valor;
    }

    private boolean requiereUrlVerificable(String plataforma) {
        return "COURSERA".equals(plataforma)
                || "UDEMY".equals(plataforma);
    }

    private String validarUrlCertificado(String plataforma, String urlVerificacion) {
        URI uri;

        try {
            uri = URI.create(urlVerificacion.trim());
        } catch (Exception e) {
            throw new IllegalArgumentException("El enlace del certificado no tiene un formato válido.");
        }

        String scheme = uri.getScheme();
        String host = uri.getHost();
        String path = uri.getPath();

        if (!"https".equalsIgnoreCase(scheme)) {
            throw new IllegalArgumentException("El enlace del certificado debe iniciar con https://");
        }

        if (!StringUtils.hasText(host) || !StringUtils.hasText(path)) {
            throw new IllegalArgumentException("El enlace del certificado no está completo.");
        }

        String hostNormalizado = host.toLowerCase(Locale.ROOT);
        String pathNormalizado = path.toLowerCase(Locale.ROOT);

        if ("COURSERA".equals(plataforma)) {
            return validarUrlCoursera(hostNormalizado, pathNormalizado);
        }

        if ("UDEMY".equals(plataforma)) {
            return validarUrlUdemy(hostNormalizado, pathNormalizado);
        }

        throw new IllegalArgumentException(
                "La plataforma del SkillPath no permite validación por enlace."
        );
    }

    private String validarUrlCoursera(String host, String path) {
        boolean hostValido = "coursera.org".equals(host)
                || "www.coursera.org".equals(host);

        boolean pathValido = path.startsWith("/verify/")
                || path.startsWith("/share/")
                || path.startsWith("/account/accomplishments/verify/")
                || path.startsWith("/account/accomplishments/certificate/")
                || path.startsWith("/account/accomplishments/specialization/")
                || path.startsWith("/account/accomplishments/professional-cert/");

        if (!hostValido || !pathValido) {
            throw new IllegalArgumentException(
                    "Para Coursera, ingresa un enlace válido de verificación o certificado."
            );
        }

        return extraerUltimoSegmento(path);
    }

    private String validarUrlUdemy(String host, String path) {
        boolean hostValido = "udemy.com".equals(host)
                || "www.udemy.com".equals(host);

        boolean pathValido = path.startsWith("/certificate/");

        if (!hostValido || !pathValido) {
            throw new IllegalArgumentException(
                    "Para Udemy, ingresa un enlace válido del certificado."
            );
        }

        return extraerUltimoSegmento(path);
    }

    private String extraerUltimoSegmento(String path) {
        if (!StringUtils.hasText(path)) {
            throw new IllegalArgumentException("No se pudo identificar el código del certificado.");
        }

        String limpio = path.trim();

        if (limpio.endsWith("/")) {
            limpio = limpio.substring(0, limpio.length() - 1);
        }

        int ultimoSlash = limpio.lastIndexOf("/");

        if (ultimoSlash < 0 || ultimoSlash == limpio.length() - 1) {
            throw new IllegalArgumentException("No se pudo identificar el código del certificado.");
        }

        String codigo = limpio.substring(ultimoSlash + 1);

        if (!StringUtils.hasText(codigo)) {
            throw new IllegalArgumentException("No se pudo identificar el código del certificado.");
        }

        return codigo;
    }


    @Override
    public List<SkillPathEstudianteResponseDTO> listarSkillPathsIniciadosEstudiante(
            String correo
    ) {
        List<UsuarioSkillPath> avances =
                usuarioSkillPathRepository.findSkillPathsIniciadosByUsuarioCorreo(
                        correo
                );

        return avances.stream()
                .map(avance -> {
                    EvidenciaSkillPath evidencia = evidenciaSkillPathRepository
                            .findTopByUsuarioSkillPath_IdUsuarioSkillPathOrderByFechaSubidaDesc(
                                    avance.getIdUsuarioSkillPath()
                            )
                            .orElse(null);

                    return mapToSkillPathEstudianteResponse(
                            avance.getSkillPath(),
                            avance,
                            evidencia
                    );
                })
                .toList();
    }

    private void eliminarEvidenciasFisicasDeS3(Integer idUsuarioSkillPath) {
        List<EvidenciaSkillPath> evidencias =
                evidenciaSkillPathRepository.findByUsuarioSkillPath_IdUsuarioSkillPath(
                        idUsuarioSkillPath
                );

        for (EvidenciaSkillPath evidencia : evidencias) {
            if (StringUtils.hasText(evidencia.getRutaArchivo())) {
                try {
                    s3Client.deleteObject(
                            DeleteObjectRequest.builder()
                                    .bucket(bucketName)
                                    .key(evidencia.getRutaArchivo())
                                    .build()
                    );
                } catch (Exception e) {
                    // No detenemos el flujo si falla el borrado físico.
                    // Pero sí conviene loguearlo si tienes @Slf4j.
                    System.err.println("No se pudo eliminar evidencia en S3: "
                            + evidencia.getRutaArchivo()
                            + " - "
                            + e.getMessage());
                }
            }
        }
    }

    @Override
    public byte[] descargarEvidenciaSkillPath(
            String correo,
            Integer idSkillPath
    ) {
        UsuarioSkillPath usuarioSkillPath = usuarioSkillPathRepository
                .findByUsuario_CorreoAndSkillPath_IdSkillPath(correo, idSkillPath)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe evidencia para este SkillPath."
                ));

        EvidenciaSkillPath evidencia = evidenciaSkillPathRepository
                .findTopByUsuarioSkillPath_IdUsuarioSkillPathOrderByFechaSubidaDesc(
                        usuarioSkillPath.getIdUsuarioSkillPath()
                )
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe evidencia para este SkillPath."
                ));

        if (!StringUtils.hasText(evidencia.getRutaArchivo())) {
            throw new IllegalArgumentException("La ruta de la evidencia no está disponible.");
        }

        try (InputStream is = s3Client.getObject(
                GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(evidencia.getRutaArchivo())
                        .build()
        )) {
            return is.readAllBytes();
        } catch (Exception e) {
            throw new RuntimeException("Error al descargar la evidencia desde S3: " + e.getMessage(), e);
        }
    }

    @Override
    public String obtenerNombreEvidenciaSkillPath(
            String correo,
            Integer idSkillPath
    ) {
        UsuarioSkillPath usuarioSkillPath = usuarioSkillPathRepository
                .findByUsuario_CorreoAndSkillPath_IdSkillPath(correo, idSkillPath)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe evidencia para este SkillPath."
                ));

        EvidenciaSkillPath evidencia = evidenciaSkillPathRepository
                .findTopByUsuarioSkillPath_IdUsuarioSkillPathOrderByFechaSubidaDesc(
                        usuarioSkillPath.getIdUsuarioSkillPath()
                )
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe evidencia para este SkillPath."
                ));

        return StringUtils.hasText(evidencia.getNombreArchivo())
                ? evidencia.getNombreArchivo()
                : "evidencia-skillpath.pdf";
    }

    private String valorPorDefecto(String valor, String defecto) {
        return StringUtils.hasText(valor) ? valor : defecto;
    }

    private Integer valorPorDefecto(Integer valor, Integer defecto) {
        return valor != null ? valor : defecto;
    }
}