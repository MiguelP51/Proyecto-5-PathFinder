package com.pathfinder.service.impl;

import com.pathfinder.dto.response.ArchivoCVResponse;
import com.pathfinder.model.entity.ArchivoCV;
import com.pathfinder.model.entity.PerfilCV;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.enums.EstadoValidacionArchivo;
import com.pathfinder.model.enums.FormatoArchivo;
import com.pathfinder.repository.ArchivoCVRepository;
import com.pathfinder.repository.PerfilCVRepository;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.service.ArchivoCVService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArchivoCVServiceImpl implements ArchivoCVService {

    private final UsuarioRepository    usuarioRepository;
    private final PerfilCVRepository   perfilCVRepository;
    private final ArchivoCVRepository  archivoCVRepository;

    @Override
    @Transactional
    public ArchivoCVResponse registrarArchivo(MultipartFile archivo, String correoUsuario) {

        Usuario usuario = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"));

        // El perfil_cv debe existir antes de registrar el archivo.
        // Si aún no existe, se crea uno vacío para asociar el archivo.
        PerfilCV perfil = perfilCVRepository.findByUsuario_Correo(correoUsuario)
                .orElseGet(() -> {
                    PerfilCV nuevo = new PerfilCV();
                    nuevo.setUsuario(usuario);
                    nuevo.setFechaActualizacionCv(LocalDateTime.now());
                    return perfilCVRepository.save(nuevo);
                });

        // RF11 — Marcar archivos anteriores como inactivos (reemplazo)
        List<ArchivoCV> anteriores =
                archivoCVRepository.findByPerfilCv_IdPerfilCvAndActivoTrue(
                        perfil.getIdPerfilCv());
        anteriores.forEach(a -> {
            a.setActivo(false);
            a.setFechaModificacion(LocalDateTime.now());
        });
        archivoCVRepository.saveAll(anteriores);

        // Calcular tamaño en MB con 2 decimales
        BigDecimal tamanoMb = BigDecimal.valueOf(archivo.getSize())
                .divide(BigDecimal.valueOf(1024 * 1024), 2, RoundingMode.HALF_UP);

        // Registrar el nuevo archivo
        ArchivoCV nuevo = new ArchivoCV();
        nuevo.setPerfilCv(perfil);
        nuevo.setNombreArchivo(archivo.getOriginalFilename());
        nuevo.setFormatoArchivo(FormatoArchivo.PDF);
        nuevo.setTamanoArchivo(tamanoMb);
        nuevo.setEstadoValidacion(EstadoValidacionArchivo.VALIDO);
        nuevo.setFechaCarga(LocalDateTime.now());
        nuevo.setActivo(true);

        // Nota: aquí se guarda solo metadatos en BD.
        // El almacenamiento físico del archivo (S3, disco, etc.)
        // debe implementarse según la infraestructura del proyecto.
        // Si se implementa, guardar la ruta en nuevo.setRutaArchivo(ruta).

        ArchivoCV guardado = archivoCVRepository.save(nuevo);
        log.info("Archivo CV registrado: {} para usuario {}", guardado.getNombreArchivo(), correoUsuario);

        return ArchivoCVResponse.builder()
                .idArchivoCv(guardado.getIdArchivoCv())
                .nombreArchivo(guardado.getNombreArchivo())
                .tamanoArchivoMb(guardado.getTamanoArchivo())
                .estadoValidacion(guardado.getEstadoValidacion())
                .fechaCarga(guardado.getFechaCarga())
                .build();
    }
}
