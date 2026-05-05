package com.pathfinder.security.jwt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret",
                "test-secret-key-must-be-at-least-256-bits-long-for-hs256-algorithm");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", 86400000L);
    }

    @Test
    void deberiaGenerarTokenValido() {
        String token = jwtTokenProvider.generateToken("user@test.com");
        assertThat(token).isNotBlank();
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
    }

    @Test
    void deberiaExtraerEmailDelToken() {
        String token = jwtTokenProvider.generateToken("user@test.com");
        assertThat(jwtTokenProvider.getEmailFromToken(token)).isEqualTo("user@test.com");
    }

    @Test
    void deberiaRechazarTokenInvalido() {
        assertThat(jwtTokenProvider.validateToken("token.invalido.xxx")).isFalse();
    }
}
