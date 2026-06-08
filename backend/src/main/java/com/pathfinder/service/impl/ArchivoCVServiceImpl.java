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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

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
    private final S3Client             s3Client;

    @Value("${aws.bucket-name}")
    private String bucketName;

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

        // RF11 — Marcar archivos anteriores como inactivos (reemplazo) y borrarlos físicamente de S3
        List<ArchivoCV> anteriores =
                archivoCVRepository.findByPerfilCv_IdPerfilCvAndActivoTrue(
                        perfil.getIdPerfilCv());
        
        for (ArchivoCV ant : anteriores) {
            ant.setActivo(false);
            ant.setFechaModificacion(LocalDateTime.now());
            if (ant.getRutaArchivo() != null && !ant.getRutaArchivo().isEmpty()) {
                try {
                    s3Client.deleteObject(DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(ant.getRutaArchivo())
                            .build());
                    log.info("Archivo de CV anterior eliminado de S3: {}", ant.getRutaArchivo());
                } catch (Exception e) {
                    log.error("Error al eliminar CV anterior de S3 (key: {}): {}", ant.getRutaArchivo(), e.getMessage());
                }
            }
        }
        archivoCVRepository.saveAll(anteriores);

        // Calcular tamaño en MB con 2 decimales
        BigDecimal tamanoMb = BigDecimal.valueOf(archivo.getSize())
                .divide(BigDecimal.valueOf(1024 * 1024), 2, RoundingMode.HALF_UP);

        // Generar clave única para S3
        String s3Key = "cvs/cv_" + perfil.getIdPerfilCv() + "_" + System.currentTimeMillis() + ".pdf";

        // Subir archivo a S3
        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(s3Key)
                            .contentType("application/pdf")
                            .build(),
                    RequestBody.fromInputStream(archivo.getInputStream(), archivo.getSize())
            );
            log.info("CV físico subido a S3 correctamente. Key: {}", s3Key);
        } catch (Exception e) {
            log.error("Error al subir archivo a S3: {}", e.getMessage(), e);
            throw new RuntimeException("Error al almacenar el archivo en S3: " + e.getMessage());
        }

        // Registrar el nuevo archivo
        ArchivoCV nuevo = new ArchivoCV();
        nuevo.setPerfilCv(perfil);
        nuevo.setNombreArchivo(archivo.getOriginalFilename());
        nuevo.setFormatoArchivo(FormatoArchivo.PDF);
        nuevo.setTamanoArchivo(tamanoMb);
        nuevo.setEstadoValidacion(EstadoValidacionArchivo.VALIDO);
        nuevo.setFechaCarga(LocalDateTime.now());
        nuevo.setActivo(true);
        nuevo.setRutaArchivo(s3Key);

        ArchivoCV guardado = archivoCVRepository.save(nuevo);
        log.info("Archivo CV registrado en BD con ruta S3: {} para usuario {}", guardado.getRutaArchivo(), correoUsuario);

        return ArchivoCVResponse.builder()
                .idArchivoCv(guardado.getIdArchivoCv())
                .nombreArchivo(guardado.getNombreArchivo())
                .tamanoArchivoMb(guardado.getTamanoArchivo())
                .estadoValidacion(guardado.getEstadoValidacion())
                .fechaCarga(guardado.getFechaCarga())
                .build();
    }
}
