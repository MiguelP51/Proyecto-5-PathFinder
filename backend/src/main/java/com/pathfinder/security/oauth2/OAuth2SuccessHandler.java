package com.pathfinder.security.oauth2;

import com.pathfinder.model.User;
import com.pathfinder.repository.UserRepository;
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
    private final UserRepository userRepository;

    @Value("${app.oauth2.authorized-redirect-uris}")
    private String redirectUri;

    // =============================================
    // WHITELIST — agrega correos aquí
    // =============================================
    private static final Set<String> ADMINS = Set.of(
            "jhuamanp@pucp.edu.pe"         // ← tu correo de admin
    );

    private static final Set<String> MENTORS = Set.of(
            "jhuamanperez1@gmail.com"
    );
    // Cualquier otro → STUDENT automáticamente
    // =============================================

    private User.Role resolveRole(String email) {
        if (ADMINS.contains(email))  return User.Role.ADMIN;
        if (MENTORS.contains(email)) return User.Role.MENTOR;
        return User.Role.STUDENT;
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

        User user = userRepository.findByEmail(email).orElseGet(() ->
                userRepository.save(User.builder()
                        .email(email)
                        .name(name)
                        .pictureUrl(picture)
                        .googleId(googleId)
                        .role(resolveRole(email))
                        .build())
        );

        user.setName(name);
        user.setPictureUrl(picture);
        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(email);
        String targetUrl = redirectUri.split(",")[0];

        String redirectUrl = UriComponentsBuilder.fromUriString(targetUrl)
                .queryParam("token", token)
                .queryParam("role", user.getRole().name())
                .build().toUriString();

        log.info("Login: {} → {}", email, user.getRole());
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}