package com.pathfinder.audit.aspect;

import com.pathfinder.audit.annotation.Audit;
import com.pathfinder.audit.event.AuditEvent;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Arrays;

/**
 * Aspecto para interceptar ejecuciones de métodos anotados con @Audit,
 * recopilar información contextual y disparar eventos de auditoría.
 */
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final ApplicationEventPublisher eventPublisher;
    private final UsuarioRepository usuarioRepository;

    @Around("@annotation(auditAnnotation)")
    public Object auditar(ProceedingJoinPoint joinPoint, Audit auditAnnotation) throws Throwable {
        LocalDateTime fecha = LocalDateTime.now();
        String correo = "ANONYMOUS";
        Integer usuarioId = null;
        String rol = "ANONYMOUS";
        String ip = "UNKNOWN";

        // 1. Obtener la IP de origen
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            ip = obtenerClientIp(request);
        }

        // 2. Extraer datos de seguridad
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            Object principal = auth.getPrincipal();
            if (principal instanceof UserDetails userDetails) {
                correo = userDetails.getUsername();
            } else if (principal instanceof Usuario userEntity) {
                correo = userEntity.getCorreo();
                usuarioId = userEntity.getIdUsuario();
            } else if (principal instanceof String principalStr) {
                correo = principalStr;
            }

            if (usuarioId == null && correo != null && !"ANONYMOUS".equals(correo)) {
                var userOpt = usuarioRepository.findByCorreo(correo.trim().toLowerCase());
                if (userOpt.isPresent()) {
                    usuarioId = userOpt.get().getIdUsuario();
                    if (userOpt.get().getRol() != null) {
                        rol = userOpt.get().getRol().name();
                    }
                }
            }
        }

        Object result;
        try {
            result = joinPoint.proceed();
            publicarEvento(auditAnnotation, correo, usuarioId, rol, ip, "EXITO", null, joinPoint.getArgs());
            return result;
        } catch (Throwable throwable) {
            publicarEvento(auditAnnotation, correo, usuarioId, rol, ip, "FALLO", throwable.getMessage(), joinPoint.getArgs());
            throw throwable;
        }
    }

    private void publicarEvento(Audit annotation, String correo, Integer usuarioId, String rol, String ip,
                                 String resultado, String errorMsg, Object[] args) {
        
        String detalles = "";
        try {
            detalles = Arrays.toString(args);
            // Si el detalle excede un tamaño prudente para TEXT, se recorta
            if (detalles.length() > 2000) {
                detalles = detalles.substring(0, 2000) + "... [Truncado]";
            }
        } catch (Exception e) {
            detalles = "[Error al serializar argumentos]";
        }

        AuditEvent event = AuditEvent.builder()
                .modulo(annotation.modulo())
                .accion(annotation.accion())
                .usuarioCorreo(correo)
                .usuarioId(usuarioId)
                .rol(rol)
                .ipOrigen(ip)
                .resultado(resultado)
                .mensajeError(errorMsg)
                .detalles(detalles)
                .fechaEvento(LocalDateTime.now())
                .build();

        eventPublisher.publishEvent(event);
    }

    private String obtenerClientIp(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }
        return ipAddress;
    }
}
