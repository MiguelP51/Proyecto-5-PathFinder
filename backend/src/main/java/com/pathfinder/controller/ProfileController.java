package com.pathfinder.controller;

import com.pathfinder.dto.cv.CVExtractadoDTO;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.service.CVService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final CVService cvService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CVExtractadoDTO>> obtenerPerfil(
            @PathVariable Integer id) {

        CVExtractadoDTO dto = cvService.obtenerCVPorUsuarioId(id);
        return ResponseEntity.ok(ApiResponse.success("Perfil encontrado", dto));
    }
}