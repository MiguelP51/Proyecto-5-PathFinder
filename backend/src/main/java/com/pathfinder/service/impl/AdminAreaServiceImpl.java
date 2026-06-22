package com.pathfinder.service.impl;

import com.pathfinder.dto.admin.area.AreaRequestDTO;
import com.pathfinder.dto.admin.area.AreaResponseDTO;
import com.pathfinder.dto.admin.subarea.SubAreaRequestDTO;
import com.pathfinder.dto.admin.subarea.SubAreaAdminResponseDTO;
import com.pathfinder.model.entity.Area;
import com.pathfinder.model.entity.SkillPath;
import com.pathfinder.model.entity.SubArea;
import com.pathfinder.repository.AreaRepository;
import com.pathfinder.repository.SkillPathRepository;
import com.pathfinder.repository.SubAreaRepository;
import com.pathfinder.service.AdminAreaService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAreaServiceImpl implements AdminAreaService {

    private final AreaRepository areaRepository;
    private final SubAreaRepository subAreaRepository;
    private final SkillPathRepository skillPathRepository;
    private final S3Client s3Client;

    @Value("${aws.bucket-name}")
    private String bucketName;

    // --- ÁREAS ---

    @Override
    @Transactional(readOnly = true)
    public List<AreaResponseDTO> listarAreas(Boolean soloActivos) {
        List<Area> areas = Boolean.TRUE.equals(soloActivos)
                ? areaRepository.findByActivoTrue()
                : areaRepository.findAll();

        return areas.stream()
                .map(this::toAreaResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AreaResponseDTO obtenerAreaPorId(String idArea) {
        Area area = areaRepository.findById(idArea)
                .orElseThrow(() -> new EntityNotFoundException("Área no encontrada con ID: " + idArea));
        return toAreaResponse(area);
    }

    @Override
    @Transactional
    public AreaResponseDTO crearArea(AreaRequestDTO request) {
        String idArea = generarSlug(request.getNombre());
        if (!StringUtils.hasText(idArea)) {
            throw new IllegalArgumentException("El nombre del área no genera un identificador válido");
        }

        if (areaRepository.existsById(idArea)) {
            throw new IllegalArgumentException("Ya existe un área registrada con el nombre: " + request.getNombre());
        }

        Area area = new Area();
        area.setIdArea(idArea);
        area.setNombre(request.getNombre().trim());
        area.setEmoji(request.getEmoji());
        area.setDescripcion(request.getDescripcion());
        area.setImagenUrl(request.getImagenUrl());
        area.setActivo(true);
        area.setFechaRegistro(LocalDateTime.now());

        return toAreaResponse(areaRepository.save(area));
    }

    @Override
    @Transactional
    public AreaResponseDTO actualizarArea(String idArea, AreaRequestDTO request) {
        Area area = areaRepository.findById(idArea)
                .orElseThrow(() -> new EntityNotFoundException("Área no encontrada con ID: " + idArea));

        String anteriorNombre = area.getNombre();
        String anteriorEmoji = area.getEmoji();

        area.setNombre(request.getNombre().trim());
        area.setEmoji(request.getEmoji());
        area.setDescripcion(request.getDescripcion());
        area.setImagenUrl(request.getImagenUrl());
        area.setFechaModificacion(LocalDateTime.now());

        Area guardada = areaRepository.save(area);

        // Propagar cambios si el nombre o el emoji han cambiado
        if (!guardada.getNombre().equalsIgnoreCase(anteriorNombre) || 
            !StringUtils.hasText(guardada.getEmoji()) && StringUtils.hasText(anteriorEmoji) ||
            guardada.getEmoji() != null && !guardada.getEmoji().equals(anteriorEmoji)) {
            
            sincronizarAreaEnSubAreasYSkillPaths(guardada);
        }

        return toAreaResponse(guardada);
    }

    @Override
    @Transactional
    public AreaResponseDTO cambiarEstadoArea(String idArea, Boolean activo) {
        Area area = areaRepository.findById(idArea)
                .orElseThrow(() -> new EntityNotFoundException("Área no encontrada con ID: " + idArea));

        area.setActivo(activo);
        area.setFechaModificacion(LocalDateTime.now());
        Area guardada = areaRepository.save(area);

        // Desactivación en cascada de subáreas
        if (Boolean.FALSE.equals(activo)) {
            List<SubArea> subareas = subAreaRepository.findByAreaId(idArea);
            for (SubArea sa : subareas) {
                sa.setActivo(false);
                sa.setFechaModificacion(LocalDateTime.now());
            }
            subAreaRepository.saveAll(subareas);
        }

        return toAreaResponse(guardada);
    }

    @Override
    @Transactional
    public String subirImagenArea(String idArea, MultipartFile file) {
        Area area = areaRepository.findById(idArea)
                .orElseThrow(() -> new EntityNotFoundException("Área no encontrada con ID: " + idArea));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo no puede estar vacío");
        }

        // Validar que sea imagen
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Solo se permiten archivos de imagen");
        }

        // Eliminar imagen anterior de S3 si existe
        if (StringUtils.hasText(area.getImagenUrl())) {
            try {
                String keyAnterior = area.getImagenUrl();
                if (keyAnterior.contains(".amazonaws.com/")) {
                    keyAnterior = keyAnterior.substring(keyAnterior.indexOf(".amazonaws.com/") + 15);
                }
                s3Client.deleteObject(DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(keyAnterior)
                        .build());
            } catch (Exception e) {
                System.err.println("No se pudo eliminar imagen antigua de S3: " + e.getMessage());
            }
        }

        // Generar nueva key de S3
        String originalFilename = file.getOriginalFilename();
        String extension = "png";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
        }
        String s3Key = "areas/area_" + idArea + "_" + System.currentTimeMillis() + "." + extension;

        try {
            s3Client.putObject(PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(contentType)
                    .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (Exception e) {
            throw new RuntimeException("Error al subir la imagen a S3: " + e.getMessage(), e);
        }

        // Guardar key de S3 en el área
        area.setImagenUrl(s3Key);
        area.setFechaModificacion(LocalDateTime.now());
        areaRepository.save(area);

        return s3Key;
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] descargarImagenArea(String idArea) {
        Area area = areaRepository.findById(idArea)
                .orElseThrow(() -> new EntityNotFoundException("Área no encontrada con ID: " + idArea));

        if (!StringUtils.hasText(area.getImagenUrl())) {
            throw new IllegalArgumentException("El área no tiene una imagen asociada");
        }

        try (java.io.InputStream is = s3Client.getObject(
                software.amazon.awssdk.services.s3.model.GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(area.getImagenUrl())
                        .build()
        )) {
            return is.readAllBytes();
        } catch (Exception e) {
            throw new RuntimeException("Error al descargar la imagen desde S3: " + e.getMessage(), e);
        }
    }

    // --- SUBÁREAS ---

    @Override
    @Transactional(readOnly = true)
    public List<SubAreaAdminResponseDTO> listarSubAreas(String areaId, Boolean soloActivos) {
        List<SubArea> subAreas;
        if (StringUtils.hasText(areaId)) {
            subAreas = Boolean.TRUE.equals(soloActivos)
                    ? subAreaRepository.findByAreaIdAndActivoTrue(areaId)
                    : subAreaRepository.findByAreaId(areaId);
        } else {
            subAreas = Boolean.TRUE.equals(soloActivos)
                    ? subAreaRepository.findByActivoTrue()
                    : subAreaRepository.findAll();
        }

        return subAreas.stream()
                .map(this::toSubAreaResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SubAreaAdminResponseDTO obtenerSubAreaPorId(Integer idSubarea) {
        SubArea sa = subAreaRepository.findById(idSubarea)
                .orElseThrow(() -> new EntityNotFoundException("SubÁrea no encontrada con ID: " + idSubarea));
        return toSubAreaResponse(sa);
    }

    @Override
    @Transactional
    public SubAreaAdminResponseDTO crearSubArea(SubAreaRequestDTO request) {
        Area area = areaRepository.findById(request.getAreaId())
                .orElseThrow(() -> new EntityNotFoundException("Área no encontrada con ID: " + request.getAreaId()));

        SubArea sa = new SubArea();
        sa.setNombre(request.getNombre().trim());
        sa.setEmoji(request.getEmoji());
        sa.setDescripcion(request.getDescripcion());
        sa.setObjetivos(request.getObjetivos());
        sa.setHabilidadesRelacionadas(request.getHabilidadesRelacionadas());
        sa.setNivel(request.getNivel());
        sa.setPlataformasSkillPath(request.getPlataformasSkillPath());
        sa.setSlug(StringUtils.hasText(request.getSlug()) ? request.getSlug().trim() : generarSlug(request.getNombre()));
        sa.setActivo(true);
        sa.setCantidadSkillPaths(0);
        sa.setCantidadPathChallenges(0);
        sa.setFechaRegistro(LocalDateTime.now());

        // Copiar datos del Área
        sa.setAreaId(area.getIdArea());
        sa.setAreaNombre(area.getNombre());
        sa.setAreaEmoji(area.getEmoji());

        return toSubAreaResponse(subAreaRepository.save(sa));
    }

    @Override
    @Transactional
    public SubAreaAdminResponseDTO actualizarSubArea(Integer idSubarea, SubAreaRequestDTO request) {
        SubArea sa = subAreaRepository.findById(idSubarea)
                .orElseThrow(() -> new EntityNotFoundException("SubÁrea no encontrada con ID: " + idSubarea));

        Area area = areaRepository.findById(request.getAreaId())
                .orElseThrow(() -> new EntityNotFoundException("Área no encontrada con ID: " + request.getAreaId()));

        String anteriorNombre = sa.getNombre();

        sa.setNombre(request.getNombre().trim());
        sa.setEmoji(request.getEmoji());
        sa.setDescripcion(request.getDescripcion());
        sa.setObjetivos(request.getObjetivos());
        sa.setHabilidadesRelacionadas(request.getHabilidadesRelacionadas());
        sa.setNivel(request.getNivel());
        sa.setPlataformasSkillPath(request.getPlataformasSkillPath());
        sa.setSlug(StringUtils.hasText(request.getSlug()) ? request.getSlug().trim() : generarSlug(request.getNombre()));
        sa.setFechaModificacion(LocalDateTime.now());

        // Actualizar datos de Área si cambian
        sa.setAreaId(area.getIdArea());
        sa.setAreaNombre(area.getNombre());
        sa.setAreaEmoji(area.getEmoji());

        SubArea guardada = subAreaRepository.save(sa);

        // Propagar cambio de nombre de subárea a SkillPaths
        if (!guardada.getNombre().equalsIgnoreCase(anteriorNombre)) {
            sincronizarSubAreaEnSkillPaths(guardada);
        }

        return toSubAreaResponse(guardada);
    }

    @Override
    @Transactional
    public SubAreaAdminResponseDTO cambiarEstadoSubArea(Integer idSubarea, Boolean activo) {
        SubArea sa = subAreaRepository.findById(idSubarea)
                .orElseThrow(() -> new EntityNotFoundException("SubÁrea no encontrada con ID: " + idSubarea));

        sa.setActivo(activo);
        sa.setFechaModificacion(LocalDateTime.now());

        return toSubAreaResponse(subAreaRepository.save(sa));
    }

    // --- MÉTODOS AUXILIARES ---

    private void sincronizarAreaEnSubAreasYSkillPaths(Area area) {
        // 1. Sincronizar en SubÁreas
        List<SubArea> subareas = subAreaRepository.findByAreaId(area.getIdArea());
        for (SubArea sa : subareas) {
            sa.setAreaNombre(area.getNombre());
            sa.setAreaEmoji(area.getEmoji());
            sa.setFechaModificacion(LocalDateTime.now());
        }
        subAreaRepository.saveAll(subareas);

        // 2. Sincronizar en SkillPaths
        List<SkillPath> skillPaths = skillPathRepository.findByAreaId(area.getIdArea());
        for (SkillPath sp : skillPaths) {
            sp.setAreaNombre(area.getNombre());
            sp.setFechaModificacion(LocalDateTime.now());
        }
        skillPathRepository.saveAll(skillPaths);
    }

    private void sincronizarSubAreaEnSkillPaths(SubArea subArea) {
        List<SkillPath> skillPaths = skillPathRepository.findBySubareaId(String.valueOf(subArea.getIdSubarea()));
        for (SkillPath sp : skillPaths) {
            sp.setSubareaNombre(subArea.getNombre());
            sp.setFechaModificacion(LocalDateTime.now());
        }
        skillPathRepository.saveAll(skillPaths);
    }

    private String generarSlug(String nombre) {
        if (nombre == null) return "";
        return nombre.toLowerCase()
                .replaceAll("[áàäâ]", "a")
                .replaceAll("[éèëê]", "e")
                .replaceAll("[íìïî]", "i")
                .replaceAll("[óòöô]", "o")
                .replaceAll("[úùüû]", "u")
                .replaceAll("[ñ]", "n")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }

    private AreaResponseDTO toAreaResponse(Area area) {
        return AreaResponseDTO.builder()
                .idArea(area.getIdArea())
                .nombre(area.getNombre())
                .emoji(area.getEmoji())
                .descripcion(area.getDescripcion())
                .imagenUrl(area.getImagenUrl())
                .activo(area.getActivo())
                .build();
    }

    private SubAreaAdminResponseDTO toSubAreaResponse(SubArea sa) {
        return SubAreaAdminResponseDTO.builder()
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
                .activo(sa.getActivo())
                .slug(sa.getSlug())
                .build();
    }
}
