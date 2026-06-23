package com.pathfinder.controller;

import com.pathfinder.service.AdminAreaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/areas")
@RequiredArgsConstructor
public class AreaImagenController {

    private final AdminAreaService adminAreaService;

    @GetMapping("/{idArea}/imagen")
    public ResponseEntity<byte[]> descargarImagen(@PathVariable String idArea) {
        try {
            byte[] data = adminAreaService.descargarImagenArea(idArea);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(data);
        } catch (IllegalArgumentException e) {
            log.warn("Imagen de área no encontrada o no disponible: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error al descargar la imagen del área: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
