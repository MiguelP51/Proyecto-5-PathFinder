package com.pathfinder.service;

import com.opencsv.CSVReader;
import com.pathfinder.dto.admin.manage_skillpath.*;
import com.pathfinder.model.entity.SkillPath;
import com.pathfinder.repository.SkillPathRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminManageSkillPathService {

    private static final Pattern DURACION_PATTERN = Pattern.compile(
            "^\\d+(\\.\\d+)?\\s*(hora|horas|minuto|minutos|min|h|dia|dias|semana|semanas|mes|meses)$",
            Pattern.CASE_INSENSITIVE
    );

    private final SkillPathRepository skillPathRepository;

    @Transactional(readOnly = true)
    public List<AdminManageSkillPathResponseDTO> listarSkillPaths(String tipo) {
        List<SkillPath> skillPaths;
        
        if ("GLOBAL".equalsIgnoreCase(tipo)) {
            skillPaths = skillPathRepository.findByUsuarioIsNull();
        } else if ("ASIGNADO".equalsIgnoreCase(tipo)) {
            skillPaths = skillPathRepository.findByUsuarioIsNotNull();
        } else {
            skillPaths = skillPathRepository.findAll();
        }
        
        return skillPaths.stream()
                .map(AdminManageSkillPathResponseDTO::from)
                .toList();
    }

    @Transactional
    public AdminManageSkillPathResponseDTO crearSkillPathGlobal(CreateAdminManageSkillPathRequestDTO request) {
        validarDuracionLabel(request.getDuracionLabel());

        SkillPath skillPath = new SkillPath();
        
        skillPath.setUsuario(null);
        skillPath.setTitulo(request.getTitulo());
        skillPath.setPlataforma(request.getPlataforma());
        skillPath.setDescripcion(request.getDescripcion());
        skillPath.setUrlExterno(request.getUrlExterno());
        skillPath.setDificultad(request.getDificultad());
        skillPath.setDuracionLabel(request.getDuracionLabel());
        skillPath.setAreaId(request.getAreaId());
        skillPath.setAreaNombre(request.getAreaNombre());
        skillPath.setSubareaId(request.getSubareaId());
        skillPath.setSubareaNombre(request.getSubareaNombre());
        skillPath.setEsRecomendado(request.getEsRecomendado() != null ? request.getEsRecomendado() : false);
        skillPath.setActivo(true);
        skillPath.setProgreso(0);
        skillPath.setXp(0);
        skillPath.setEstado("DISPONIBLE");

        return AdminManageSkillPathResponseDTO.from(skillPathRepository.save(skillPath));
    }

    @Transactional
    public AdminManageSkillPathResponseDTO actualizarSkillPath(Integer id, UpdateAdminManageSkillPathRequestDTO request) {
        SkillPath skillPath = skillPathRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SkillPath no encontrado con ID: " + id));

        validarDuracionLabel(request.getDuracionLabel());

        if (request.getTitulo() != null) skillPath.setTitulo(request.getTitulo());
        if (request.getPlataforma() != null) skillPath.setPlataforma(request.getPlataforma());
        if (request.getDescripcion() != null) skillPath.setDescripcion(request.getDescripcion());
        if (request.getUrlExterno() != null) skillPath.setUrlExterno(request.getUrlExterno());
        if (request.getDificultad() != null) skillPath.setDificultad(request.getDificultad());
        if (request.getDuracionLabel() != null) skillPath.setDuracionLabel(request.getDuracionLabel());
        if (request.getAreaId() != null) skillPath.setAreaId(request.getAreaId());
        if (request.getAreaNombre() != null) skillPath.setAreaNombre(request.getAreaNombre());
        if (request.getSubareaId() != null) skillPath.setSubareaId(request.getSubareaId());
        if (request.getSubareaNombre() != null) skillPath.setSubareaNombre(request.getSubareaNombre());
        if (request.getEsRecomendado() != null) skillPath.setEsRecomendado(request.getEsRecomendado());

        return AdminManageSkillPathResponseDTO.from(skillPathRepository.save(skillPath));
    }

    @Transactional
    public void eliminarSkillPath(Integer id) {
        SkillPath skillPath = skillPathRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SkillPath no encontrado con ID: " + id));
        skillPath.setActivo(false);
        skillPath.setFechaModificacion(LocalDateTime.now());
        skillPathRepository.save(skillPath);
    }

    @Transactional
    public AdminManageSkillPathResponseDTO cambiarEstado(Integer id, Boolean activo) {
        SkillPath skillPath = skillPathRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SkillPath no encontrado con ID: " + id));

        skillPath.setActivo(activo);
        skillPath.setFechaModificacion(LocalDateTime.now());

        return AdminManageSkillPathResponseDTO.from(skillPathRepository.save(skillPath));
    }

    @Transactional
    public BulkAdminManageSkillPathResultDTO importarCsv(MultipartFile file) {
        List<String> errores = new ArrayList<>();
        int procesados = 0;
        int creados = 0;

        try (CSVReader csvReader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            List<String[]> rows = csvReader.readAll();
            
            if (!rows.isEmpty()) {
                rows.remove(0); // skip header
            }

            for (int i = 0; i < rows.size(); i++) {
                String[] row = rows.get(i);
                procesados++;
                
                try {
                    if (row.length < 2) {
                        errores.add("Fila " + (i + 2) + ": Formato inválido o incompleto");
                        continue;
                    }

                    SkillPath skillPath = new SkillPath();
                    String duracionLabel = row.length > 4 ? row[4] : "";
                    validarDuracionLabel(duracionLabel);

                    skillPath.setUsuario(null);
                    skillPath.setTitulo(row[0]);
                    skillPath.setPlataforma(row.length > 1 ? row[1] : "");
                    skillPath.setAreaNombre(row.length > 2 ? row[2] : "");
                    skillPath.setDificultad(row.length > 3 ? row[3] : "");
                    skillPath.setDuracionLabel(duracionLabel);
                    skillPath.setUrlExterno(row.length > 5 ? row[5] : "");
                    skillPath.setDescripcion(row.length > 6 ? row[6] : "");
                    skillPath.setActivo(true);
                    skillPath.setProgreso(0);
                    skillPath.setXp(0);
                    skillPath.setEstado("DISPONIBLE");

                    skillPathRepository.save(skillPath);
                    creados++;
                } catch (Exception e) {
                    log.error("Error en la fila {}: {}", i + 2, e.getMessage());
                    errores.add("Fila " + (i + 2) + ": " + e.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("Error al procesar archivo CSV", e);
            throw new RuntimeException("Error al leer el archivo CSV: " + e.getMessage());
        }

        return BulkAdminManageSkillPathResultDTO.builder()
                .procesados(procesados)
                .creados(creados)
                .errores(errores.size())
                .detalleErrores(errores)
                .build();
    }

    private void validarDuracionLabel(String duracionLabel) {
        if (duracionLabel == null || duracionLabel.isBlank()) {
            return;
        }

        if (!DURACION_PATTERN.matcher(duracionLabel.trim()).matches()) {
            throw new IllegalArgumentException(
                    "La duracion debe tener numero y unidad. Ejemplo: 6 horas"
            );
        }
    }
}
