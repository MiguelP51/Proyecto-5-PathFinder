package com.pathfinder.service;

public interface EmailService {
    void enviarCorreoConfirmacion(String destinatario, String estudianteNombre, String mentorNombre, String fecha, String hora, String tipo, String enlace);
    void enviarCorreoCancelacionOReagendacion(String destinatario, String estudianteNombre, String mentorNombre, String fecha, String hora, String nuevoEstado, String motivo);
}

