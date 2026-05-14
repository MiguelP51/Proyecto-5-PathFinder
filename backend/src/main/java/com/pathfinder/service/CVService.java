package com.pathfinder.service;

import com.pathfinder.dto.cv.CVExtractadoDTO;
import org.springframework.web.multipart.MultipartFile;

public interface CVService {

    /**
     * Recibe un archivo PDF/DOCX, extrae el texto y usa Claude AI
     * para parsearlo en un CVExtractadoDTO listo para edición en el front.
     */
    CVExtractadoDTO extraerCV(MultipartFile archivo) throws Exception;

    /**
     * Persiste el CV editado por el usuario en la BD,
     * asociándolo al usuario autenticado.
     */
    CVExtractadoDTO guardarCV(CVExtractadoDTO dto, String correoUsuario);

    /**
     * Devuelve el CV guardado del usuario autenticado.
     */
    CVExtractadoDTO obtenerCV(String correoUsuario);
}
