package com.pathfinder.controller;

import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.model.entity.ConfiguracionCampoCV;
import com.pathfinder.model.entity.AreaEntrevista;
import com.pathfinder.model.entity.PuestoEntrevista;
import com.pathfinder.repository.ConfiguracionCampoCVRepository;
import com.pathfinder.repository.AreaEntrevistaRepository;
import com.pathfinder.repository.PuestoEntrevistaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@RestController
@RequiredArgsConstructor
public class EnrollmentConfigController {

    private final ConfiguracionCampoCVRepository fieldRepository;
    private final AreaEntrevistaRepository areaRepository;
    private final PuestoEntrevistaRepository puestoRepository;

    // ==========================================
    // CV FIELDS CONFIGURATION (ADMIN)
    // ==========================================

    @GetMapping("/api/admin/enrollment/cv-fields")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ConfiguracionCampoCV>>> getAllCvFields() {
        try {
            List<ConfiguracionCampoCV> fields = fieldRepository.findAllByOrderByOrdenAsc();
            return ResponseEntity.ok(ApiResponse.success("Campos de CV obtenidos con éxito", fields));
        } catch (Exception e) {
            log.error("Error al obtener campos de CV: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al obtener campos de CV"));
        }
    }

    @PostMapping("/api/admin/enrollment/cv-fields")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<ConfiguracionCampoCV>> createCvField(
            @RequestBody Map<String, Object> payload) {
        try {
            String label = (String) payload.get("label");
            String tipo = (String) payload.get("tipo");
            Boolean requerido = (Boolean) payload.getOrDefault("requerido", false);

            if (label == null || label.trim().isEmpty() || tipo == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("El nombre y tipo son obligatorios"));
            }

            // Generar clave única
            String clave = "custom_" + label.trim().toLowerCase()
                    .replaceAll("[^a-z0-9]", "_")
                    .replaceAll("_+", "_");
            
            // Si ya existe la clave, añadir un sufijo aleatorio
            if (fieldRepository.existsByClave(clave)) {
                clave = clave + "_" + System.currentTimeMillis() % 1000;
            }

            // Obtener el orden máximo actual
            int maxOrden = fieldRepository.findAll().stream()
                    .mapToInt(ConfiguracionCampoCV::getOrden)
                    .max()
                    .orElse(-1);

            ConfiguracionCampoCV campo = new ConfiguracionCampoCV();
            campo.setClave(clave);
            campo.setLabel(label.trim());
            campo.setTipo(tipo);
            campo.setRequerido(requerido);
            campo.setActivo(true);
            campo.setOrden(maxOrden + 1);
            campo.setEsCustom(true);

            ConfiguracionCampoCV saved = fieldRepository.save(campo);
            return ResponseEntity.ok(ApiResponse.success("Campo personalizado creado con éxito", saved));
        } catch (Exception e) {
            log.error("Error al crear campo de CV: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al crear campo de CV"));
        }
    }

    @PutMapping("/api/admin/enrollment/cv-fields/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<ConfiguracionCampoCV>> updateCvField(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> payload) {
        try {
            ConfiguracionCampoCV campo = fieldRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Campo no encontrado"));

            if (payload.containsKey("label")) {
                campo.setLabel(((String) payload.get("label")).trim());
            }
            if (payload.containsKey("requerido")) {
                campo.setRequerido((Boolean) payload.get("requerido"));
            }
            if (payload.containsKey("activo")) {
                campo.setActivo((Boolean) payload.get("activo"));
            }

            ConfiguracionCampoCV saved = fieldRepository.save(campo);
            return ResponseEntity.ok(ApiResponse.success("Campo de CV actualizado con éxito", saved));
        } catch (Exception e) {
            log.error("Error al actualizar campo de CV: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al actualizar campo de CV"));
        }
    }

    @PutMapping("/api/admin/enrollment/cv-fields/reorder")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> reorderCvFields(
            @RequestBody List<Integer> orderedIds) {
        try {
            for (int i = 0; i < orderedIds.size(); i++) {
                Integer id = orderedIds.get(i);
                Optional<ConfiguracionCampoCV> fieldOpt = fieldRepository.findById(id);
                if (fieldOpt.isPresent()) {
                    ConfiguracionCampoCV campo = fieldOpt.get();
                    campo.setOrden(i);
                    fieldRepository.save(campo);
                }
            }
            return ResponseEntity.ok(ApiResponse.success("Campos reordenados con éxito", null));
        } catch (Exception e) {
            log.error("Error al reordenar campos de CV: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al reordenar campos de CV"));
        }
    }

    // ==========================================
    // CV FIELDS CONSUMPTION (STUDENT)
    // ==========================================

    @GetMapping("/api/profile/cv-fields")
    public ResponseEntity<ApiResponse<List<ConfiguracionCampoCV>>> getActiveCvFields() {
        try {
            List<ConfiguracionCampoCV> fields = fieldRepository.findByActivoTrueOrderByOrdenAsc();
            return ResponseEntity.ok(ApiResponse.success("Campos activos de CV obtenidos con éxito", fields));
        } catch (Exception e) {
            log.error("Error al obtener campos activos de CV: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al obtener campos activos de CV"));
        }
    }

    // ==========================================
    // AREAS & POSITIONS (ADMIN)
    // ==========================================

    @GetMapping("/api/admin/enrollment/areas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAdminAreas() {
        try {
            List<AreaEntrevista> areas = areaRepository.findAllByOrderByNombreAsc();
            List<Map<String, Object>> response = new ArrayList<>();

            for (AreaEntrevista area : areas) {
                Map<String, Object> areaMap = new HashMap<>();
                areaMap.put("idArea", area.getIdArea());
                areaMap.put("nombre", area.getNombre());
                areaMap.put("activo", area.getActivo());

                List<PuestoEntrevista> puestos = puestoRepository.findByArea_IdAreaOrderByNombreAsc(area.getIdArea());
                areaMap.put("puestos", puestos);

                response.add(areaMap);
            }
            return ResponseEntity.ok(ApiResponse.success("Áreas y puestos obtenidos con éxito", response));
        } catch (Exception e) {
            log.error("Error al obtener áreas y puestos: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al obtener áreas y puestos"));
        }
    }

    @PostMapping("/api/admin/enrollment/areas")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<AreaEntrevista>> createArea(
            @RequestBody Map<String, Object> payload) {
        try {
            String nombre = (String) payload.get("nombre");
            if (nombre == null || nombre.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("El nombre del área es obligatorio"));
            }

            if (areaRepository.findByNombre(nombre.trim()).isPresent()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Ya existe un área con ese nombre"));
            }

            AreaEntrevista area = new AreaEntrevista();
            area.setNombre(nombre.trim());
            area.setActivo(true);

            AreaEntrevista saved = areaRepository.save(area);
            return ResponseEntity.ok(ApiResponse.success("Área creada con éxito", saved));
        } catch (Exception e) {
            log.error("Error al crear área: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al crear área"));
        }
    }

    @PutMapping("/api/admin/enrollment/areas/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<AreaEntrevista>> updateArea(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> payload) {
        try {
            AreaEntrevista area = areaRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Área no encontrada"));

            if (payload.containsKey("nombre")) {
                String nombre = (String) payload.get("nombre");
                if (nombre != null && !nombre.trim().isEmpty()) {
                    area.setNombre(nombre.trim());
                }
            }
            if (payload.containsKey("activo")) {
                area.setActivo((Boolean) payload.get("activo"));
            }

            AreaEntrevista saved = areaRepository.save(area);
            return ResponseEntity.ok(ApiResponse.success("Área actualizada con éxito", saved));
        } catch (Exception e) {
            log.error("Error al actualizar área: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al actualizar área"));
        }
    }

    @PostMapping("/api/admin/enrollment/areas/{id}/puestos")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<PuestoEntrevista>> createPuesto(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> payload) {
        try {
            AreaEntrevista area = areaRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Área no encontrada"));

            String nombre = (String) payload.get("nombre");
            if (nombre == null || nombre.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("El nombre del puesto es obligatorio"));
            }

            if (puestoRepository.existsByArea_IdAreaAndNombreIgnoreCase(area.getIdArea(), nombre.trim())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Ya existe este puesto en esta área"));
            }

            PuestoEntrevista puesto = new PuestoEntrevista();
            puesto.setNombre(nombre.trim());
            puesto.setArea(area);
            puesto.setActivo(true);

            PuestoEntrevista saved = puestoRepository.save(puesto);
            return ResponseEntity.ok(ApiResponse.success("Puesto creado con éxito", saved));
        } catch (Exception e) {
            log.error("Error al crear puesto: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al crear puesto"));
        }
    }

    @PutMapping("/api/admin/enrollment/areas/puestos/{idPuesto}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<PuestoEntrevista>> updatePuesto(
            @PathVariable Integer idPuesto,
            @RequestBody Map<String, Object> payload) {
        try {
            PuestoEntrevista puesto = puestoRepository.findById(idPuesto)
                    .orElseThrow(() -> new IllegalArgumentException("Puesto no encontrado"));

            if (payload.containsKey("nombre")) {
                String nombre = (String) payload.get("nombre");
                if (nombre != null && !nombre.trim().isEmpty()) {
                    puesto.setNombre(nombre.trim());
                }
            }
            if (payload.containsKey("activo")) {
                puesto.setActivo((Boolean) payload.get("activo"));
            }

            PuestoEntrevista saved = puestoRepository.save(puesto);
            return ResponseEntity.ok(ApiResponse.success("Puesto actualizado con éxito", saved));
        } catch (Exception e) {
            log.error("Error al actualizar puesto: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al actualizar puesto"));
        }
    }

    // ==========================================
    // AREAS & POSITIONS CONSUMPTION (STUDENT)
    // ==========================================

    @GetMapping("/api/entrevistas/areas")
    public ResponseEntity<ApiResponse<Map<String, List<String>>>> getActiveAreasAndPuestos() {
        try {
            List<AreaEntrevista> areas = areaRepository.findByActivoTrueOrderByNombreAsc();
            Map<String, List<String>> response = new LinkedHashMap<>();

            for (AreaEntrevista area : areas) {
                List<PuestoEntrevista> puestos = puestoRepository.findByArea_IdAreaAndActivoTrueOrderByNombreAsc(area.getIdArea());
                List<String> nombresPuestos = new ArrayList<>();
                for (PuestoEntrevista p : puestos) {
                    nombresPuestos.add(p.getNombre());
                }
                if (!nombresPuestos.isEmpty()) {
                    response.put(area.getNombre(), nombresPuestos);
                }
            }
            return ResponseEntity.ok(ApiResponse.success("Áreas y puestos activos obtenidos con éxito", response));
        } catch (Exception e) {
            log.error("Error al obtener áreas y puestos activos: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al obtener áreas y puestos activos"));
        }
    }
}
