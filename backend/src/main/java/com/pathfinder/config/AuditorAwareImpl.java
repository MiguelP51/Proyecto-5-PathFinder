package com.pathfinder.config;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("auditorAwareImpl")
public class AuditorAwareImpl implements AuditorAware<Integer> {

    @Override
    public Optional<Integer> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();

        try {
            Object idUsuario = principal.getClass()
                    .getMethod("getIdUsuario")
                    .invoke(principal);

            if (idUsuario instanceof Integer id) {
                return Optional.of(id);
            }
        } catch (Exception ignored) {
            // No consultar la base de datos aquí para evitar ciclos de auditoría.
        }

        return Optional.empty();
    }
}