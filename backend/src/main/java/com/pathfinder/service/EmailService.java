package com.pathfinder.service;

public interface EmailService {
    boolean enviarCorreoConfirmacion(String destinatario, String estudianteNombre, String mentorNombre, String mentorCorreo, String fecha, String hora, String tipo, String enlace);
    boolean enviarCorreoCancelacionOReagendacion(String destinatario, String estudianteNombre, String mentorNombre, String fecha, String hora, String nuevoEstado, String motivo);
}
