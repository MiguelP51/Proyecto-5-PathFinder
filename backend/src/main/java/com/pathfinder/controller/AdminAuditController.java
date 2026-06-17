package com.pathfinder.controller;

import com.pathfinder.audit.repository.BitacoraAuditoriaRepository;
import com.pathfinder.dto.admin.audit.BitacoraAuditoriaResponseDTO;
import com.pathfinder.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controlador REST para exponer los logs de auditoría al Administrador.
 */
@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditController {

    private final BitacoraAuditoriaRepository auditoriaRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BitacoraAuditoriaResponseDTO>>> obtenerLogsAuditoria() {
        List<BitacoraAuditoriaResponseDTO> logs = auditoriaRepository
                .findAll(Sort.by(Sort.Direction.DESC, "fechaEvento"))
                .stream()
                .map(BitacoraAuditoriaResponseDTO::from)
                .toList();

        return ResponseEntity.ok(
                ApiResponse.success("Logs de auditoría obtenidos correctamente", logs)
        );
    }
}
