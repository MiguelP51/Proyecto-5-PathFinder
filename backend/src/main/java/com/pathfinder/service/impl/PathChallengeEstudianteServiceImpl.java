package com.pathfinder.service.impl;

import com.pathfinder.model.entity.PerfilEntrenamiento;
import com.pathfinder.repository.PerfilEntrenamientoRepository;
import com.pathfinder.repository.InsigniaRepository;
import com.pathfinder.service.GamificacionService;
import com.pathfinder.dto.student.pathchallenge.PathChallengeAvanceRequestDTO;
import com.pathfinder.dto.student.pathchallenge.PathChallengeEstudianteResponseDTO;
import com.pathfinder.dto.student.pathchallenge.PathChallengeFinalizarRequestDTO;
import com.pathfinder.dto.student.pathchallenge.PathChallengeTaskResponseRequestDTO;
import com.pathfinder.model.entity.Habilidad;
import com.pathfinder.model.entity.PathChallenge;
import com.pathfinder.model.entity.PathChallengeTask;
import com.pathfinder.model.entity.SubArea;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.entity.UsuarioPathChallenge;
import com.pathfinder.model.entity.UsuarioPathChallengeTask;
import com.pathfinder.repository.PathChallengeRepository;
import com.pathfinder.repository.PathChallengeTaskRepository;
import com.pathfinder.repository.UsuarioPathChallengeRepository;
import com.pathfinder.repository.UsuarioPathChallengeTaskRepository;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.service.PathChallengeEstudianteService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import lombok.extern.slf4j.Slf4j;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.InputStream;
import java.util.Locale;
import java.util.Set;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashMap;

import static java.util.stream.Collectors.toMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class PathChallengeEstudianteServiceImpl implements PathChallengeEstudianteService {

    private static final String ESTADO_DISPONIBLE = "DISPONIBLE";
    private static final String ESTADO_EN_PROGRESO = "EN_PROGRESO";
    private static final String ESTADO_COMPLETADO = "COMPLETADO";

    private final UsuarioRepository usuarioRepository;
    private final PathChallengeRepository pathChallengeRepository;
    private final PathChallengeTaskRepository pathChallengeTaskRepository;
    private final UsuarioPathChallengeRepository usuarioPathChallengeRepository;
    private final UsuarioPathChallengeTaskRepository usuarioPathChallengeTaskRepository;
    private final ObjectMapper objectMapper;
    private final S3Client s3Client;
    private final GamificacionService gamificacionService;

    @Value("${aws.bucket-name}")
    private String bucketName;

    @Override
    @Transactional(readOnly = true)
    public List<PathChallengeEstudianteResponseDTO> listarIniciados(String correo) {
        List<UsuarioPathChallenge> avances =
                usuarioPathChallengeRepository.findIniciadosByUsuarioCorreo(correo);

        if (avances.isEmpty()) {
            return List.of();
        }

        return avances.stream()
                .map(avance -> mapToResponse(
                        avance.getPathChallenge(),
                        avance,
                        false
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PathChallengeEstudianteResponseDTO> listarPorSubarea(
            String correo,
            Integer idSubarea
    ) {
        List<PathChallenge> challenges =
                pathChallengeRepository.findPublicadosBySubAreaWithHabilidades(idSubarea);

        if (challenges.isEmpty()) {
            return List.of();
        }

        List<Integer> ids = challenges.stream()
                .map(PathChallenge::getIdPathChallenge)
                .toList();

        Map<Integer, UsuarioPathChallenge> avancesPorChallenge =
                usuarioPathChallengeRepository
                        .findByUsuario_CorreoAndPathChallenge_IdPathChallengeInAndActivoTrue(correo, ids)
                        .stream()
                        .collect(toMap(
                                avance -> avance.getPathChallenge().getIdPathChallenge(),
                                avance -> avance
                        ));

        return challenges.stream()
                .map(challenge -> mapToResponse(
                        challenge,
                        avancesPorChallenge.get(challenge.getIdPathChallenge()),
                        false
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PathChallengeEstudianteResponseDTO obtenerDetalle(
            String correo,
            Integer idPathChallenge
    ) {
        PathChallenge challenge = obtenerChallengePublicado(idPathChallenge);

        UsuarioPathChallenge avance = usuarioPathChallengeRepository
                .findByUsuario_CorreoAndPathChallenge_IdPathChallengeAndActivoTrue(correo, idPathChallenge)
                .orElse(null);

        return mapToResponse(challenge, avance, true);
    }

    @Override
    @Transactional
    public PathChallengeEstudianteResponseDTO iniciar(
            String correo,
            Integer idPathChallenge
    ) {
        Usuario usuario = obtenerUsuario(correo);
        PathChallenge challenge = obtenerChallengePublicado(idPathChallenge);

        UsuarioPathChallenge avance = usuarioPathChallengeRepository
                .findByUsuario_IdUsuarioAndPathChallenge_IdPathChallengeAndActivoTrue(
                        usuario.getIdUsuario(),
                        idPathChallenge
                )
                .orElseGet(() -> {
                    UsuarioPathChallenge nuevo = new UsuarioPathChallenge();
                    nuevo.setUsuario(usuario);
                    nuevo.setPathChallenge(challenge);
                    nuevo.setEstado(ESTADO_EN_PROGRESO);
                    nuevo.setProgresoPorcentaje(0);
                    nuevo.setFechaInicio(LocalDateTime.now());
                    nuevo.setFechaUltimoAvance(LocalDateTime.now());
                    return usuarioPathChallengeRepository.save(nuevo);
                });

        if (!ESTADO_COMPLETADO.equalsIgnoreCase(avance.getEstado())) {
            avance.setEstado(ESTADO_EN_PROGRESO);
            avance.setFechaUltimoAvance(LocalDateTime.now());
            avance = usuarioPathChallengeRepository.save(avance);
        }

        return mapToResponse(challenge, avance, true);
    }

    @Override
    @Transactional
    public PathChallengeEstudianteResponseDTO guardarAvance(
            String correo,
            Integer idPathChallenge,
            PathChallengeAvanceRequestDTO request
    ) {
        Usuario usuario = obtenerUsuario(correo);
        PathChallenge challenge = obtenerChallengePublicado(idPathChallenge);

        UsuarioPathChallenge avance = obtenerOCrearAvance(usuario, challenge);

        List<PathChallengeTask> tareas = obtenerTareasChallenge(idPathChallenge);

        Set<Integer> legacyCompletedTaskIds = request != null
                ? normalizarIds(request.getCompletedTaskIds())
                : new HashSet<>();

        Map<Integer, PathChallengeTaskResponseRequestDTO> respuestasPorTarea =
                request != null
                        ? mapTaskResponses(request.getTaskResponses())
                        : Map.of();

        boolean traeEstadoDeTareas =
                !legacyCompletedTaskIds.isEmpty() || !respuestasPorTarea.isEmpty();

        Set<Integer> completedTaskIds;

        if (traeEstadoDeTareas) {
            validarTareasPertenecenAlChallenge(legacyCompletedTaskIds, tareas);
            validarTareasPertenecenAlChallenge(respuestasPorTarea.keySet(), tareas);

            completedTaskIds = resolverIdsTareasCompletadas(
                    tareas,
                    respuestasPorTarea,
                    legacyCompletedTaskIds
            );

            sincronizarTareas(
                    avance,
                    tareas,
                    respuestasPorTarea,
                    completedTaskIds
            );
        } else {
            completedTaskIds = obtenerIdsTareasCompletadas(
                    avance.getIdUsuarioPathChallenge()
            );
        }

        int progreso = calcularProgreso(tareas, completedTaskIds);

        if (!ESTADO_COMPLETADO.equalsIgnoreCase(avance.getEstado())) {
            avance.setEstado(ESTADO_EN_PROGRESO);
        }

        avance.setProgresoPorcentaje(progreso);
        avance.setFechaUltimoAvance(LocalDateTime.now());

        if (request != null && request.getEntregaTexto() != null) {
            avance.setEntregaTexto(request.getEntregaTexto().trim());
        }

        avance = usuarioPathChallengeRepository.save(avance);

        return mapToResponse(challenge, avance, true);
    }

    @Override
    @Transactional
    public PathChallengeEstudianteResponseDTO finalizar(
            String correo,
            Integer idPathChallenge,
            PathChallengeFinalizarRequestDTO request
    ) {
        Usuario usuario = obtenerUsuario(correo);
        PathChallenge challenge = obtenerChallengePublicado(idPathChallenge);

        UsuarioPathChallenge avance = obtenerOCrearAvance(usuario, challenge);

        List<PathChallengeTask> tareas = obtenerTareasChallenge(idPathChallenge);

        if (tareas.isEmpty()) {
            throw new IllegalArgumentException("La misión no tiene tareas configuradas");
        }

        Set<Integer> legacyCompletedTaskIds = request != null
                ? normalizarIds(request.getCompletedTaskIds())
                : new HashSet<>();

        Map<Integer, PathChallengeTaskResponseRequestDTO> respuestasPorTarea =
                request != null
                        ? mapTaskResponses(request.getTaskResponses())
                        : Map.of();

        boolean traeEstadoDeTareas =
                !legacyCompletedTaskIds.isEmpty() || !respuestasPorTarea.isEmpty();

        Set<Integer> completedTaskIds;

        if (traeEstadoDeTareas) {
            validarTareasPertenecenAlChallenge(legacyCompletedTaskIds, tareas);
            validarTareasPertenecenAlChallenge(respuestasPorTarea.keySet(), tareas);

            completedTaskIds = resolverIdsTareasCompletadas(
                    tareas,
                    respuestasPorTarea,
                    legacyCompletedTaskIds
            );

            sincronizarTareas(
                    avance,
                    tareas,
                    respuestasPorTarea,
                    completedTaskIds
            );
        } else {
            completedTaskIds = obtenerIdsTareasCompletadas(
                    avance.getIdUsuarioPathChallenge()
            );
        }

        boolean todasObligatoriasCompletadas = tareas.stream()
                .filter(tarea -> tarea.getObligatoria() == null || Boolean.TRUE.equals(tarea.getObligatoria()))
                .allMatch(tarea -> completedTaskIds.contains(tarea.getIdPathChallengeTask()));

        if (!todasObligatoriasCompletadas) {
            throw new IllegalArgumentException("Debes completar todas las tareas obligatorias antes de enviar la misión");
        }

        String entregaTexto = request != null ? request.getEntregaTexto() : null;

        if (entregaTexto != null) {
            entregaTexto = entregaTexto.trim();
            avance.setEntregaTexto(entregaTexto);
        } else {
            entregaTexto = avance.getEntregaTexto();
        }

        boolean tieneEntregaTexto = entregaTexto != null && !entregaTexto.isBlank();
        boolean tieneArchivo = avance.getArchivoUrl() != null && !avance.getArchivoUrl().isBlank();

        if (!tieneEntregaTexto && !tieneArchivo) {
            throw new IllegalArgumentException("Debes registrar una entrega antes de finalizar la misión");
        }

        boolean yaEstabaCompletado = ESTADO_COMPLETADO.equalsIgnoreCase(avance.getEstado());

        avance.setEstado(ESTADO_COMPLETADO);
        avance.setProgresoPorcentaje(100);
        avance.setFechaUltimoAvance(LocalDateTime.now());

        if (avance.getFechaFinalizacion() == null) {
            avance.setFechaFinalizacion(LocalDateTime.now());
        }

        avance = usuarioPathChallengeRepository.save(avance);

        if (!yaEstabaCompletado) {
            Integer completadasActuales = challenge.getCompletadas() != null
                    ? challenge.getCompletadas()
                    : 0;

            challenge.setCompletadas(completadasActuales + 1);
            pathChallengeRepository.save(challenge);

            // HU-EST-32: otorgar XP e insignias al completar la misión por primera vez
            gamificacionService.sumarXp(usuario, challenge.getXp());
            gamificacionService.evaluarYOtorgarInsignias(usuario);
        }

        return mapToResponse(challenge, avance, true);
    }

    @Override
    @Transactional
    public PathChallengeEstudianteResponseDTO subirArchivoTarea(
            String correo,
            Integer idPathChallenge,
            Integer idPathChallengeTask,
            MultipartFile file
    ) {
        validarArchivoChallenge(file);

        Usuario usuario = obtenerUsuario(correo);
        PathChallenge challenge = obtenerChallengePublicado(idPathChallenge);

        PathChallengeTask tarea = pathChallengeTaskRepository
                .findById(idPathChallengeTask)
                .orElseThrow(() -> new IllegalArgumentException("La actividad no existe"));

        if (!tarea.getPathChallenge().getIdPathChallenge().equals(idPathChallenge)) {
            throw new IllegalArgumentException("La actividad no pertenece a este PathChallenge");
        }

        if (!"FILE_UPLOAD".equalsIgnoreCase(tarea.getTipoTarea())) {
            throw new IllegalArgumentException("Esta actividad no permite subir archivos");
        }

        UsuarioPathChallenge avance = obtenerOCrearAvance(usuario, challenge);

        UsuarioPathChallengeTask avanceTarea =
                usuarioPathChallengeTaskRepository
                        .findByUsuarioPathChallenge_IdUsuarioPathChallengeAndPathChallengeTask_IdPathChallengeTaskAndActivoTrue(
                                avance.getIdUsuarioPathChallenge(),
                                idPathChallengeTask
                        )
                        .orElseGet(() -> {
                            UsuarioPathChallengeTask nuevo = new UsuarioPathChallengeTask();
                            nuevo.setUsuarioPathChallenge(avance);
                            nuevo.setPathChallengeTask(tarea);
                            nuevo.setActivo(true);
                            nuevo.setFechaRegistro(LocalDateTime.now());
                            return nuevo;
                        });

        if (StringUtils.hasText(avanceTarea.getArchivoUrl())) {
            eliminarArchivoChallengeDeS3(avanceTarea.getArchivoUrl());
        }

        String nombreOriginal = file.getOriginalFilename();
        String extension = obtenerExtension(nombreOriginal);

        String s3Key = "pathchallenge-entregas/usuario_"
                + usuario.getIdUsuario()
                + "/pathchallenge_"
                + idPathChallenge
                + "/task_"
                + idPathChallengeTask
                + "_"
                + System.currentTimeMillis()
                + "."
                + extension;

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(s3Key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );
        } catch (Exception e) {
            throw new RuntimeException(
                    "Error al almacenar el archivo en S3: " + e.getMessage(),
                    e
            );
        }

        avanceTarea.setArchivoNombre(nombreOriginal);
        avanceTarea.setArchivoUrl(s3Key);
        avanceTarea.setCompletada(true);
        avanceTarea.setFechaCompletada(LocalDateTime.now());
        avanceTarea.setRespuestaJson("""
            {"uploaded":true,"fileName":"%s","s3Key":"%s"}
            """.formatted(
                escaparJson(nombreOriginal),
                escaparJson(s3Key)
        ).trim());

        usuarioPathChallengeTaskRepository.save(avanceTarea);

        List<PathChallengeTask> tareas = obtenerTareasChallenge(idPathChallenge);
        Set<Integer> completedTaskIds = obtenerIdsTareasCompletadas(
                avance.getIdUsuarioPathChallenge()
        );

        avance.setEstado(ESTADO_EN_PROGRESO);
        avance.setProgresoPorcentaje(calcularProgreso(tareas, completedTaskIds));
        avance.setFechaUltimoAvance(LocalDateTime.now());

        usuarioPathChallengeRepository.save(avance);

        return mapToResponse(challenge, avance, true);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] descargarArchivoTarea(
            String correo,
            Integer idPathChallenge,
            Integer idPathChallengeTask
    ) {
        UsuarioPathChallengeTask avanceTarea = obtenerAvanceTareaConArchivo(
                correo,
                idPathChallenge,
                idPathChallengeTask
        );

        try (InputStream inputStream = s3Client.getObject(
                GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(avanceTarea.getArchivoUrl())
                        .build()
        )) {
            return inputStream.readAllBytes();
        } catch (Exception e) {
            throw new RuntimeException(
                    "Error al descargar el archivo desde S3: " + e.getMessage(),
                    e
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public String obtenerNombreArchivoTarea(
            String correo,
            Integer idPathChallenge,
            Integer idPathChallengeTask
    ) {
        UsuarioPathChallengeTask avanceTarea = obtenerAvanceTareaConArchivo(
                correo,
                idPathChallenge,
                idPathChallengeTask
        );

        if (StringUtils.hasText(avanceTarea.getArchivoNombre())) {
            return avanceTarea.getArchivoNombre();
        }

        return "archivo-pathchallenge";
    }

    @Override
    public byte[] descargarRecursoBaseTarea(
            String correo,
            Integer idPathChallenge,
            Integer idPathChallengeTask,
            String tipoRecurso
    ) {
        usuarioRepository.findByCorreoAndActivoTrue(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        PathChallengeTask tarea = pathChallengeTaskRepository
                .findActiveTaskInChallenge(idPathChallengeTask, idPathChallenge)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        String s3Key = obtenerKeyRecursoBase(tarea, tipoRecurso);

        if (!StringUtils.hasText(s3Key)) {
            throw new RuntimeException("La tarea no tiene un recurso configurado para descargar");
        }

        validarKeyRecursoPathChallenge(s3Key);

        try (InputStream inputStream = s3Client.getObject(
                GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(s3Key)
                        .build()
        )) {
            return inputStream.readAllBytes();
        } catch (Exception e) {
            log.error("Error descargando recurso base de PathChallenge desde S3: {}", s3Key, e);
            throw new RuntimeException("No se pudo descargar el recurso de la tarea");
        }
    }

    @Override
    public String obtenerNombreRecursoBaseTarea(
            String correo,
            Integer idPathChallenge,
            Integer idPathChallengeTask,
            String tipoRecurso
    ) {
        usuarioRepository.findByCorreoAndActivoTrue(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        PathChallengeTask tarea = pathChallengeTaskRepository
                .findActiveTaskInChallenge(idPathChallengeTask, idPathChallenge)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        return obtenerNombreRecursoBase(tarea, tipoRecurso);
    }

    private String obtenerKeyRecursoBase(PathChallengeTask tarea, String tipoRecurso) {
        JsonNode config = leerConfigJson(tarea);

        String tipo = tipoRecurso == null ? "" : tipoRecurso.toLowerCase();

        return switch (tipo) {
            case "document", "archivo", "file" -> obtenerTexto(config, "documentKey");
            case "preview", "imagen", "image" -> obtenerTexto(config, "previewImageKey");
            default -> throw new RuntimeException("Tipo de recurso no soportado: " + tipoRecurso);
        };
    }

    private String obtenerNombreRecursoBase(PathChallengeTask tarea, String tipoRecurso) {
        JsonNode config = leerConfigJson(tarea);

        String tipo = tipoRecurso == null ? "" : tipoRecurso.toLowerCase();

        String nombre = switch (tipo) {
            case "document", "archivo", "file" -> obtenerTexto(config, "documentName");
            case "preview", "imagen", "image" -> obtenerTexto(config, "previewImageName");
            default -> null;
        };

        if (StringUtils.hasText(nombre)) {
            return nombre;
        }

        return "recurso-pathchallenge";
    }

    private JsonNode leerConfigJson(PathChallengeTask tarea) {
        try {
            if (!StringUtils.hasText(tarea.getConfigJson())) {
                return objectMapper.createObjectNode();
            }

            return objectMapper.readTree(tarea.getConfigJson());
        } catch (Exception e) {
            throw new RuntimeException("El config_json de la tarea no tiene un formato válido");
        }
    }

    private String obtenerTexto(JsonNode node, String fieldName) {
        if (node == null || !node.hasNonNull(fieldName)) {
            return null;
        }

        String value = node.get(fieldName).asText();

        return StringUtils.hasText(value) ? value : null;
    }

    private void validarKeyRecursoPathChallenge(String s3Key) {
        if (!s3Key.startsWith("pathchallenge-recursos/")) {
            throw new RuntimeException("El recurso configurado no pertenece a PathChallenges");
        }
    }

    private UsuarioPathChallengeTask obtenerAvanceTareaConArchivo(
            String correo,
            Integer idPathChallenge,
            Integer idPathChallengeTask
    ) {
        Usuario usuario = obtenerUsuario(correo);
        PathChallenge challenge = obtenerChallengePublicado(idPathChallenge);

        PathChallengeTask tarea = pathChallengeTaskRepository
                .findById(idPathChallengeTask)
                .orElseThrow(() -> new IllegalArgumentException("La actividad no existe"));

        if (!tarea.getPathChallenge().getIdPathChallenge().equals(challenge.getIdPathChallenge())) {
            throw new IllegalArgumentException("La actividad no pertenece a este PathChallenge");
        }

        UsuarioPathChallenge avance = usuarioPathChallengeRepository
                .findByUsuario_IdUsuarioAndPathChallenge_IdPathChallengeAndActivoTrue(
                        usuario.getIdUsuario(),
                        idPathChallenge
                )
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe avance para este PathChallenge"
                ));

        UsuarioPathChallengeTask avanceTarea = usuarioPathChallengeTaskRepository
                .findByUsuarioPathChallenge_IdUsuarioPathChallengeAndPathChallengeTask_IdPathChallengeTaskAndActivoTrue(
                        avance.getIdUsuarioPathChallenge(),
                        idPathChallengeTask
                )
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe archivo para esta actividad"
                ));

        if (!StringUtils.hasText(avanceTarea.getArchivoUrl())) {
            throw new IllegalArgumentException("La ruta del archivo no está disponible");
        }

        return avanceTarea;
    }

    private void validarArchivoChallenge(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Debes seleccionar un archivo.");
        }

        long maxSizeBytes = 10L * 1024L * 1024L;

        if (file.getSize() > maxSizeBytes) {
            throw new IllegalArgumentException("El archivo no debe superar los 10 MB.");
        }

        String extension = obtenerExtension(file.getOriginalFilename());

        Set<String> extensionesPermitidas = Set.of(
                "pdf",
                "docx",
                "xlsx",
                "jpg",
                "jpeg",
                "png"
        );

        if (!extensionesPermitidas.contains(extension)) {
            throw new IllegalArgumentException(
                    "Formato no permitido. Solo se aceptan PDF, DOCX, XLSX, JPG o PNG."
            );
        }
    }

    private String obtenerExtension(String nombreArchivo) {
        if (!StringUtils.hasText(nombreArchivo) || !nombreArchivo.contains(".")) {
            throw new IllegalArgumentException("El archivo debe tener una extensión válida.");
        }

        return nombreArchivo
                .substring(nombreArchivo.lastIndexOf(".") + 1)
                .toLowerCase(Locale.ROOT);
    }

    private void eliminarArchivoChallengeDeS3(String s3Key) {
        if (!StringUtils.hasText(s3Key)) {
            return;
        }

        try {
            s3Client.deleteObject(
                    DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(s3Key)
                            .build()
            );
        } catch (Exception e) {
            log.warn("No se pudo eliminar archivo anterior de PathChallenge en S3: {}", e.getMessage());
        }
    }

    private String escaparJson(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }

    private Usuario obtenerUsuario(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
    }

    private PathChallenge obtenerChallengePublicado(Integer idPathChallenge) {
        return pathChallengeRepository.findPublicadoByIdWithHabilidades(idPathChallenge)
                .orElseThrow(() -> new EntityNotFoundException("PathChallenge no encontrado o no publicado"));
    }

    private UsuarioPathChallenge obtenerOCrearAvance(
            Usuario usuario,
            PathChallenge challenge
    ) {
        return usuarioPathChallengeRepository
                .findByUsuario_IdUsuarioAndPathChallenge_IdPathChallengeAndActivoTrue(
                        usuario.getIdUsuario(),
                        challenge.getIdPathChallenge()
                )
                .orElseGet(() -> {
                    UsuarioPathChallenge nuevo = new UsuarioPathChallenge();
                    nuevo.setUsuario(usuario);
                    nuevo.setPathChallenge(challenge);
                    nuevo.setEstado(ESTADO_EN_PROGRESO);
                    nuevo.setProgresoPorcentaje(0);
                    nuevo.setFechaInicio(LocalDateTime.now());
                    nuevo.setFechaUltimoAvance(LocalDateTime.now());
                    return usuarioPathChallengeRepository.save(nuevo);
                });
    }

    private List<PathChallengeTask> obtenerTareasChallenge(Integer idPathChallenge) {
        return pathChallengeTaskRepository
                .findByPathChallenge_IdPathChallengeOrderByOrdenAsc(idPathChallenge);
    }

    private Set<Integer> normalizarIds(Collection<Integer> ids) {
        if (ids == null) {
            return new HashSet<>();
        }

        return new HashSet<>(ids);
    }

    private void validarTareasPertenecenAlChallenge(
            Set<Integer> completedTaskIds,
            List<PathChallengeTask> tareas
    ) {
        Set<Integer> idsValidos = tareas.stream()
                .map(PathChallengeTask::getIdPathChallengeTask)
                .collect(java.util.stream.Collectors.toSet());

        for (Integer idTask : completedTaskIds) {
            if (!idsValidos.contains(idTask)) {
                throw new IllegalArgumentException("Una de las tareas no pertenece a esta misión");
            }
        }
    }

    private void sincronizarTareas(
            UsuarioPathChallenge avance,
            List<PathChallengeTask> tareas,
            Map<Integer, PathChallengeTaskResponseRequestDTO> respuestasPorTarea,
            Set<Integer> completedTaskIds
    ) {
        List<UsuarioPathChallengeTask> registros =
                usuarioPathChallengeTaskRepository
                        .findByUsuarioPathChallenge_IdUsuarioPathChallengeAndActivoTrue(
                                avance.getIdUsuarioPathChallenge()
                        );

        Map<Integer, UsuarioPathChallengeTask> registrosPorTask =
                registros.stream()
                        .collect(toMap(
                                registro -> registro.getPathChallengeTask().getIdPathChallengeTask(),
                                registro -> registro
                        ));

        for (PathChallengeTask tarea : tareas) {
            UsuarioPathChallengeTask registro = registrosPorTask
                    .get(tarea.getIdPathChallengeTask());

            if (registro == null) {
                registro = new UsuarioPathChallengeTask();
                registro.setUsuarioPathChallenge(avance);
                registro.setPathChallengeTask(tarea);
            }

            PathChallengeTaskResponseRequestDTO respuesta =
                    respuestasPorTarea.get(tarea.getIdPathChallengeTask());

            if (respuesta != null) {
                if (respuesta.getResponseText() != null) {
                    registro.setRespuestaTexto(respuesta.getResponseText().trim());
                }

                if (respuesta.getSelectedOption() != null) {
                    registro.setOpcionSeleccionada(respuesta.getSelectedOption().trim());
                }

                if (respuesta.getFileName() != null) {
                    registro.setArchivoNombre(respuesta.getFileName().trim());
                }

                if (respuesta.getFileUrl() != null) {
                    registro.setArchivoUrl(respuesta.getFileUrl().trim());
                }

                if (respuesta.getResponseJson() != null) {
                    registro.setRespuestaJson(respuesta.getResponseJson().trim());
                }
            }

            boolean completada = completedTaskIds.contains(tarea.getIdPathChallengeTask());

            registro.setCompletada(completada);

            if (completada && registro.getFechaCompletada() == null) {
                registro.setFechaCompletada(LocalDateTime.now());
            }

            if (!completada) {
                registro.setFechaCompletada(null);
            }

            usuarioPathChallengeTaskRepository.save(registro);
        }
    }

    private Map<Integer, PathChallengeTaskResponseRequestDTO> mapTaskResponses(
            List<PathChallengeTaskResponseRequestDTO> responses
    ) {
        if (responses == null || responses.isEmpty()) {
            return Map.of();
        }

        Map<Integer, PathChallengeTaskResponseRequestDTO> map = new HashMap<>();

        for (PathChallengeTaskResponseRequestDTO response : responses) {
            if (response != null && response.getIdPathChallengeTask() != null) {
                map.put(response.getIdPathChallengeTask(), response);
            }
        }

        return map;
    }

    private Set<Integer> resolverIdsTareasCompletadas(
            List<PathChallengeTask> tareas,
            Map<Integer, PathChallengeTaskResponseRequestDTO> respuestasPorTarea,
            Set<Integer> legacyCompletedTaskIds
    ) {
        Set<Integer> completedTaskIds = new HashSet<>();

        for (PathChallengeTask tarea : tareas) {
            PathChallengeTaskResponseRequestDTO respuesta =
                    respuestasPorTarea.get(tarea.getIdPathChallengeTask());

            boolean completada = resolverCompletada(
                    tarea,
                    respuesta,
                    legacyCompletedTaskIds
            );

            if (completada) {
                completedTaskIds.add(tarea.getIdPathChallengeTask());
            }
        }

        return completedTaskIds;
    }

    private boolean resolverCompletada(
            PathChallengeTask tarea,
            PathChallengeTaskResponseRequestDTO respuesta,
            Set<Integer> legacyCompletedTaskIds
    ) {
        Integer idTarea = tarea.getIdPathChallengeTask();

        if (respuesta == null) {
            return legacyCompletedTaskIds.contains(idTarea);
        }

        String tipo = tarea.getTipoTarea() != null
                ? tarea.getTipoTarea().trim().toUpperCase()
                : "INFORMATION";

        return switch (tipo) {
            case "INFORMATION", "SCENARIO", "RESOURCE_REVIEW", "MULTI_SELECT", "PLAN_BUILDER", "FINAL_REVIEW" ->
                    Boolean.TRUE.equals(respuesta.getCompleted())
                            || legacyCompletedTaskIds.contains(idTarea);

            case "CHOICE", "SINGLE_CHOICE" ->
                    isNotBlank(respuesta.getSelectedOption());

            case "TEXT_RESPONSE" ->
                    isNotBlank(respuesta.getResponseText())
                            || isNotBlank(respuesta.getResponseJson());

            case "FILE_UPLOAD" ->
                    isNotBlank(respuesta.getFileUrl())
                            || isNotBlank(respuesta.getFileName());

            default ->
                    Boolean.TRUE.equals(respuesta.getCompleted())
                            || legacyCompletedTaskIds.contains(idTarea);
        };
    }

    private boolean isNotBlank(String value) {
        return value != null && !value.trim().isBlank();
    }

    private int calcularProgreso(
            List<PathChallengeTask> tareas,
            Set<Integer> completedTaskIds
    ) {
        if (tareas.isEmpty()) {
            return 0;
        }

        return (int) Math.round((completedTaskIds.size() * 100.0) / tareas.size());
    }

    private Set<Integer> obtenerIdsTareasCompletadas(Integer idUsuarioPathChallenge) {
        return usuarioPathChallengeTaskRepository
                .findByUsuarioPathChallenge_IdUsuarioPathChallengeAndActivoTrue(idUsuarioPathChallenge)
                .stream()
                .filter(registro -> Boolean.TRUE.equals(registro.getCompletada()))
                .map(registro -> registro.getPathChallengeTask().getIdPathChallengeTask())
                .collect(java.util.stream.Collectors.toSet());
    }

    private PathChallengeEstudianteResponseDTO mapToResponse(
            PathChallenge challenge,
            UsuarioPathChallenge avance,
            boolean incluirTareas
    ) {
        SubArea subArea = challenge.getSubArea();

        List<PathChallengeTask> tareas = obtenerTareasChallenge(challenge.getIdPathChallenge());

        Map<Integer, UsuarioPathChallengeTask> tareasCompletadas = obtenerTareasCompletadasMap(avance);

        int totalTareas = tareas.size();

        int completadas = avance == null
                ? 0
                : (int) tareasCompletadas.values()
                .stream()
                .filter(t -> Boolean.TRUE.equals(t.getCompletada()))
                .count();

        int progreso = avance != null && avance.getProgresoPorcentaje() != null
                ? avance.getProgresoPorcentaje()
                : 0;

        String status = avance != null && avance.getEstado() != null
                ? avance.getEstado()
                : ESTADO_DISPONIBLE;

        List<PathChallengeEstudianteResponseDTO.PathChallengeTaskEstudianteDTO> tareasDTO =
                incluirTareas
                        ? tareas.stream()
                        .map(tarea -> {
                            UsuarioPathChallengeTask avanceTarea =
                                    tareasCompletadas.get(tarea.getIdPathChallengeTask());

                            return PathChallengeEstudianteResponseDTO.PathChallengeTaskEstudianteDTO
                                    .builder()
                                    .idPathChallengeTask(tarea.getIdPathChallengeTask())
                                    .title(
                                            tarea.getTitulo() != null && !tarea.getTitulo().isBlank()
                                                    ? tarea.getTitulo()
                                                    : "Tarea " + tarea.getOrden()
                                    )
                                    .description(tarea.getDescripcion())
                                    .taskType(
                                            tarea.getTipoTarea() != null && !tarea.getTipoTarea().isBlank()
                                                    ? tarea.getTipoTarea()
                                                    : "INFORMATION"
                                    )
                                    .content(tarea.getContenido())
                                    .configJson(tarea.getConfigJson())
                                    .options(parseOptions(tarea.getOpcionesJson()))
                                    .order(tarea.getOrden())
                                    .required(
                                            tarea.getObligatoria() == null
                                                    ? true
                                                    : tarea.getObligatoria()
                                    )
                                    .completed(
                                            avanceTarea != null
                                                    && Boolean.TRUE.equals(avanceTarea.getCompletada())
                                    )
                                    .responseText(avanceTarea != null ? avanceTarea.getRespuestaTexto() : null)
                                    .selectedOption(avanceTarea != null ? avanceTarea.getOpcionSeleccionada() : null)
                                    .fileName(avanceTarea != null ? avanceTarea.getArchivoNombre() : null)
                                    .fileUrl(
                                            avanceTarea != null && StringUtils.hasText(avanceTarea.getArchivoUrl())
                                                    ? "/api/pathchallenges/estudiante/"
                                                    + challenge.getIdPathChallenge()
                                                    + "/tareas/"
                                                    + tarea.getIdPathChallengeTask()
                                                    + "/archivo/download"
                                                    : null
                                    )
                                    .responseJson(avanceTarea != null ? avanceTarea.getRespuestaJson() : null)
                                    .build();
                        })
                        .toList()
                        : new ArrayList<>();

        return PathChallengeEstudianteResponseDTO.builder()
                .id(String.valueOf(challenge.getIdPathChallenge()))
                .idPathChallenge(challenge.getIdPathChallenge())
                .areaId(subArea != null ? subArea.getAreaId() : null)
                .areaName(subArea != null ? subArea.getAreaNombre() : null)
                .subareaId(subArea != null ? String.valueOf(subArea.getIdSubarea()) : null)
                .subareaName(subArea != null ? subArea.getNombre() : null)
                .title(challenge.getTitulo())
                .description(buildDescription(challenge, subArea))
                .difficulty(challenge.getDificultad())
                .durationLabel(buildDurationLabel(challenge.getDificultad()))
                .xp(challenge.getXp())
                .progressPercentage(progreso)
                .status(status)
                .completedTasksCount(completadas)
                .totalTasksCount(totalTareas)
                .skills(mapSkills(challenge.getHabilidades()))
                .tasks(tareasDTO)
                .submission(buildSubmission(avance))
                .reward(buildReward(challenge, avance))
                .build();
    }

    private List<String> parseOptions(String opcionesJson) {
        if (opcionesJson == null || opcionesJson.isBlank()) {
            return List.of();
        }

        try {
            return objectMapper.readValue(
                    opcionesJson,
                    new TypeReference<List<String>>() {}
            );
        } catch (Exception e) {
            return List.of();
        }
    }

    private Map<Integer, UsuarioPathChallengeTask> obtenerTareasCompletadasMap(
            UsuarioPathChallenge avance
    ) {
        if (avance == null || avance.getIdUsuarioPathChallenge() == null) {
            return Map.of();
        }

        return usuarioPathChallengeTaskRepository
                .findByUsuarioPathChallenge_IdUsuarioPathChallengeAndActivoTrue(
                        avance.getIdUsuarioPathChallenge()
                )
                .stream()
                .collect(toMap(
                        registro -> registro.getPathChallengeTask().getIdPathChallengeTask(),
                        registro -> registro
                ));
    }

    private List<PathChallengeEstudianteResponseDTO.PathChallengeSkillDTO> mapSkills(
            List<Habilidad> habilidades
    ) {
        if (habilidades == null) {
            return List.of();
        }

        return habilidades.stream()
                .map(habilidad -> PathChallengeEstudianteResponseDTO.PathChallengeSkillDTO
                        .builder()
                        .id(String.valueOf(habilidad.getIdHabilidad()))
                        .name(habilidad.getNombreHabilidad())
                        .build())
                .toList();
    }

    private PathChallengeEstudianteResponseDTO.PathChallengeSubmissionDTO buildSubmission(
            UsuarioPathChallenge avance
    ) {
        if (avance == null) {
            return null;
        }

        return PathChallengeEstudianteResponseDTO.PathChallengeSubmissionDTO
                .builder()
                .text(avance.getEntregaTexto())
                .fileName(avance.getArchivoNombre())
                .fileUrl(avance.getArchivoUrl())
                .updatedAt(toIso(avance.getFechaUltimoAvance()))
                .completedAt(toIso(avance.getFechaFinalizacion()))
                .build();
    }

    private PathChallengeEstudianteResponseDTO.PathChallengeRewardDTO buildReward(
            PathChallenge challenge,
            UsuarioPathChallenge avance
    ) {
        if (avance == null || !ESTADO_COMPLETADO.equalsIgnoreCase(avance.getEstado())) {
            return null;
        }

        return PathChallengeEstudianteResponseDTO.PathChallengeRewardDTO
                .builder()
                .xpAwarded(challenge.getXp())
                .badgeName("Misión completada")
                .badgeDescription("Completaste un PathChallenge práctico")
                .awardedAt(toIso(avance.getFechaFinalizacion()))
                .build();
    }

    private String buildDescription(
            PathChallenge challenge,
            SubArea subArea
    ) {
        if (subArea != null && subArea.getNombre() != null) {
            return "Completa esta misión práctica para aplicar tus habilidades en "
                    + subArea.getNombre()
                    + ".";
        }

        return "Completa esta misión práctica para aplicar tus habilidades.";
    }

    private String buildDurationLabel(String dificultad) {
        if (dificultad == null) {
            return "30-45 min";
        }

        String normalized = dificultad.trim().toLowerCase();

        if (normalized.contains("fácil") || normalized.contains("facil") || normalized.contains("básico") || normalized.contains("basico")) {
            return "30 min";
        }

        if (normalized.contains("difícil") || normalized.contains("dificil") || normalized.contains("avanzado")) {
            return "90 min";
        }

        return "60 min";
    }

    private String toIso(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.toString() : null;
    }
}