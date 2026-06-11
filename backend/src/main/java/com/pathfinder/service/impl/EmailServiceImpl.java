package com.pathfinder.service.impl;

import com.pathfinder.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public boolean enviarCorreoConfirmacion(String destinatario, String estudianteNombre, String mentorNombre, String fecha, String hora, String tipo, String enlace) {
        log.info("Enviando correo real de confirmación de entrevista para: {}", destinatario);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(destinatario);
            message.setSubject("Confirmación de Entrevista Simulada - PathFinder");
            
            StringBuilder text = new StringBuilder();
            text.append("Hola ").append(estudianteNombre).append(",\n\n")
                .append("Tu entrevista simulada ha sido agendada con éxito.\n\n")
                .append("Detalles de la Cita:\n")
                .append("  Mentor: ").append(mentorNombre).append("\n")
                .append("  Fecha: ").append(fecha).append("\n")
                .append("  Hora: ").append(hora).append(" hs\n")
                .append("  Modalidad: ").append(tipo).append("\n");
            
            if (enlace != null && !enlace.isEmpty()) {
                text.append("  Enlace Virtual: ").append(enlace).append("\n");
            } else {
                text.append("  Enlace Virtual: Pendiente de registrar por el mentor.\n");
            }
            
            text.append("\n¡Prepárate adecuadamente y ten tu CV listo!\n\n")
                .append("Atentamente,\nEl equipo de PathFinder");
                
            message.setText(text.toString());
            mailSender.send(message);
            log.info("Correo de confirmación enviado exitosamente a {}", destinatario);
            return true;
        } catch (Exception e) {
            log.error("Fallo al enviar el correo real de confirmación a {}: {}", destinatario, e.getMessage());
            return false;
        }
    }

    @Override
    public boolean enviarCorreoCancelacionOReagendacion(String destinatario, String estudianteNombre, String mentorNombre, String fecha, String hora, String nuevoEstado, String motivo) {
        log.info("Enviando correo real de {} para: {}", nuevoEstado, destinatario);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(destinatario);
            message.setSubject("Actualización de Entrevista Simulada - " + nuevoEstado + " - PathFinder");
            
            StringBuilder text = new StringBuilder();
            text.append("Hola,\n\n")
                .append("Te informamos que la entrevista simulada programada ha cambiado de estado a: ")
                .append(nuevoEstado).append(".\n\n")
                .append("Detalles de la Cita:\n")
                .append("  Estudiante: ").append(estudianteNombre).append("\n")
                .append("  Mentor: ").append(mentorNombre).append("\n")
                .append("  Fecha: ").append(fecha).append("\n")
                .append("  Hora: ").append(hora).append(" hs\n\n")
                .append("Motivo del cambio:\n")
                .append("  \"").append(motivo).append("\"\n\n")
                .append("Atentamente,\nEl equipo de PathFinder");
                
            message.setText(text.toString());
            mailSender.send(message);
            log.info("Correo de {} enviado exitosamente a {}", nuevoEstado, destinatario);
            return true;
        } catch (Exception e) {
            log.error("Fallo al enviar el correo real de {} a {}: {}", nuevoEstado, destinatario, e.getMessage());
            return false;
        }
    }
}
