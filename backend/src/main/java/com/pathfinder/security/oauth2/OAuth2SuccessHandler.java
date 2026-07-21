package com.pathfinder.security.oauth2;

import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.enums.RolUsuario;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.security.jwt.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.SavedRequest;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UsuarioRepository usuarioRepository;

    @Value("${app.oauth2.authorized-redirect-uris}")
    private String redirectUri;

    @Value("${app.admin.emails:jhuamanp@pucp.edu.pe}")
    private List<String> adminEmails;

    private final HttpSessionRequestCache requestCache = new HttpSessionRequestCache();

    private static final Set<String> MENTORS = Set.of(
            "jhuamanperez1@gmail.com"
    );

    private RolUsuario resolveRole(String email) {
        if (email != null && adminEmails.stream().anyMatch(admin -> admin.trim().equalsIgnoreCase(email))) {
            return RolUsuario.ADMIN;
        }
        if (MENTORS.contains(email)) return RolUsuario.MENTOR;
        return RolUsuario.USER;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attrs = oAuth2User.getAttributes();
        String email    = (String) attrs.get("email");
        String name     = (String) attrs.get("name");
        String picture  = (String) attrs.get("picture");
        String googleId = (String) attrs.get("sub");

        Optional<Usuario> usuarioOptional = usuarioRepository.findByCorreo(email);
        boolean nuevoUsuario = usuarioOptional.isEmpty();
        Usuario usuario = usuarioOptional.orElseGet(() -> {
            Usuario u = new Usuario();
            u.setCorreo(email);
            u.setNombreCompleto(name);
            u.setAvatarUrl(picture);
            u.setGoogleUid(googleId);
            u.setRol(resolveRole(email));
            u.setActivo(true);
            return usuarioRepository.save(u);
        });

        if (usuario.getNombreCompleto() == null || usuario.getNombreCompleto().isBlank()) {
            usuario.setNombreCompleto(name);
        }
        usuario.setAvatarUrl(picture);
        usuarioRepository.save(usuario);

        String token = jwtTokenProvider.generateToken(email);
        String targetUrl = resolveTargetUrl(request);
        String redirectUrl = UriComponentsBuilder.fromUriString(targetUrl)
                .queryParam("token", token)
                .queryParam("role", usuario.getRol().name())
                .queryParam("newUser", nuevoUsuario)
                .build().toUriString();

        log.info("Login exitoso: {} → {}", email, usuario.getRol());
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private String resolveTargetUrl(HttpServletRequest request) {
        SavedRequest savedRequest = requestCache.getRequest(request, null);
        if (savedRequest != null && isSwaggerUrl(savedRequest.getRedirectUrl())) {
            requestCache.removeRequest(request, null);
            return savedRequest.getRedirectUrl();
        }
        return redirectUri.split(",")[0];
    }

    private boolean isSwaggerUrl(String url) {
        return url != null && (url.contains("/swagger-ui") || url.contains("/v3/api-docs"));
    }
}
