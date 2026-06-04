package com.pathfinder.config;

import com.pathfinder.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("auditorAwareImpl")
@RequiredArgsConstructor
public class AuditorAwareImpl implements AuditorAware<Integer> {

    private final UsuarioRepository usuarioRepository;

    @Override
    public Optional<Integer> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        String correo = authentication.getName();

        if (correo == null || correo.isBlank() || "anonymousUser".equals(correo)) {
            return Optional.empty();
        }

        return usuarioRepository.findByCorreo(correo)
                .map(usuario -> usuario.getIdUsuario());
    }
}