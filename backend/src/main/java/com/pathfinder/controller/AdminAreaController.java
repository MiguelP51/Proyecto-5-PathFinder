package com.pathfinder.controller;

import com.pathfinder.dto.admin.area.AreaRequestDTO;
import com.pathfinder.dto.admin.area.AreaResponseDTO;
import com.pathfinder.dto.admin.area.EstadoActivoRequestDTO;
import com.pathfinder.dto.admin.area.SubareaRequestDTO;
import com.pathfinder.dto.admin.area.SubareaResponseDTO;
import com.pathfinder.service.AdminAreaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminAreaController {

    private final AdminAreaService adminAreaService;

    @GetMapping("/areas")
    public List<AreaResponseDTO> listarAreas() {
        return adminAreaService.listarAreas();
    }

    @GetMapping("/areas/{idArea}")
    public AreaResponseDTO obtenerArea(@PathVariable Integer idArea) {
        return adminAreaService.obtenerArea(idArea);
    }

    @PostMapping("/areas")
    @ResponseStatus(HttpStatus.CREATED)
    public AreaResponseDTO crearArea(@RequestBody AreaRequestDTO request) {
        return adminAreaService.crearArea(request);
    }

    @PutMapping("/areas/{idArea}")
    public AreaResponseDTO actualizarArea(
            @PathVariable Integer idArea,
            @RequestBody AreaRequestDTO request
    ) {
        return adminAreaService.actualizarArea(idArea, request);
    }

    @PatchMapping("/areas/{idArea}/status")
    public AreaResponseDTO actualizarEstadoArea(
            @PathVariable Integer idArea,
            @RequestBody EstadoActivoRequestDTO request
    ) {
        return adminAreaService.actualizarEstadoArea(idArea, request.getActivo());
    }

    @GetMapping("/areas/{idArea}/subareas")
    public List<SubareaResponseDTO> listarSubareasPorArea(@PathVariable Integer idArea) {
        return adminAreaService.listarSubareasPorArea(idArea);
    }

    @PostMapping("/areas/{idArea}/subareas")
    @ResponseStatus(HttpStatus.CREATED)
    public SubareaResponseDTO crearSubarea(
            @PathVariable Integer idArea,
            @RequestBody SubareaRequestDTO request
    ) {
        return adminAreaService.crearSubarea(idArea, request);
    }

    @PutMapping("/subareas/{idSubarea}")
    public SubareaResponseDTO actualizarSubarea(
            @PathVariable Integer idSubarea,
            @RequestBody SubareaRequestDTO request
    ) {
        return adminAreaService.actualizarSubarea(idSubarea, request);
    }

    @PatchMapping("/subareas/{idSubarea}/status")
    public SubareaResponseDTO actualizarEstadoSubarea(
            @PathVariable Integer idSubarea,
            @RequestBody EstadoActivoRequestDTO request
    ) {
        return adminAreaService.actualizarEstadoSubarea(idSubarea, request.getActivo());
    }
}