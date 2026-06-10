package com.pathfinder.service;

import com.pathfinder.dto.response.ArchivoCVResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ArchivoCVService {

    /**
     * HU-EST-05 / RF10 / RF11
     * Registra el archivo PDF en la tabla archivo_cv asociado al perfil del usuario.
     * Si el usuario ya tenía un archivo activo, lo marca como inactivo antes de insertar
     * el nuevo (reemplazo de CV).
     */
    ArchivoCVResponse registrarArchivo(MultipartFile archivo, String correoUsuario);
}
