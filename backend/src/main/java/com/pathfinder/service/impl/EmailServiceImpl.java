package com.pathfinder.service.impl;

import com.pathfinder.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    @Override
    public void enviarCorreoConfirmacion(String destinatario, String estudianteNombre, String mentorNombre, String fecha, String hora, String tipo, String enlace) {
        log.info("==========================================================================");
        log.info("ENVIANDO CORREO ELECTRÓNICO (SIMULACIÓN):");
        log.info("Para: {}", destinatario);
        log.info("Asunto: Confirmación de Entrevista Simulada - PathFinder");
        log.info("Hola {},", estudianteNombre);
        log.info("Tu entrevista simulada ha sido agendada con éxito.");
        log.info("Detalles de la Cita:");
        log.info("  Mentor: {}", mentorNombre);
        log.info("  Fecha: {}", fecha);
        log.info("  Hora: {}", hora);
        log.info("  Modalidad: {}", tipo);
        if (enlace != null && !enlace.isEmpty()) {
            log.info("  Enlace Virtual: {}", enlace);
        } else {
            log.info("  Enlace Virtual: Pendiente de registrar por el mentor.");
        }
        log.info("¡Prepárate adecuadamente y ten tu CV listo!");
        log.info("Atentamente, El equipo de PathFinder");
        log.info("==========================================================================");
    }
}
