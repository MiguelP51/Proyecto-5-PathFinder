package com.pathfinder.controller;

import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.FeriadoDTO;
import com.pathfinder.repository.FeriadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feriados")
@RequiredArgsConstructor
public class FeriadoController {

    private final FeriadoRepository feriadoRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FeriadoDTO>>> obtenerFeriados() {
        List<FeriadoDTO> feriados = feriadoRepository.findAll().stream()
                .filter(f -> Boolean.TRUE.equals(f.getActivo()))
                .map(f -> FeriadoDTO.builder()
                        .fecha(f.getFecha().toString())
                        .descripcion(f.getDescripcion())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Feriados obtenidos", feriados));
    }
}
