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
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UsuarioRepository usuarioRepository;

    @Value("${app.oauth2.authorized-redirect-uris}")
    private String redirectUri;

    private static final Set<String> ADMINS = Set.of(
            "jhuamanp@pucp.edu.pe"
    );
    private static final Set<String> MENTORS = Set.of(
            "jhuamanperez1@gmail.com"
    );

    private RolUsuario resolveRole(String email) {
        if (ADMINS.contains(email))  return RolUsuario.ADMIN;
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

        Usuario usuario = usuarioRepository.findByCorreo(email).orElseGet(() -> {
            Usuario u = new Usuario();
            u.setCorreo(email);
            u.setNombreCompleto(name);
            u.setAvatarUrl(picture);
            u.setGoogleUid(googleId);
            u.setRol(resolveRole(email));
            return usuarioRepository.save(u);
        });

        usuario.setNombreCompleto(name);
        usuario.setAvatarUrl(picture);
        usuarioRepository.save(usuario);

        String token = jwtTokenProvider.generateToken(email);
        String targetUrl = redirectUri.split(",")[0];
        String redirectUrl = UriComponentsBuilder.fromUriString(targetUrl)
                .queryParam("token", token)
                .queryParam("role", usuario.getRol().name())
                .build().toUriString();

        log.info("Login exitoso: {} → {}", email, usuario.getRol());
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
