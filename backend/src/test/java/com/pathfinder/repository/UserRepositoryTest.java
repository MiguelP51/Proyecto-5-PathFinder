package com.pathfinder.repository;

import com.pathfinder.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void deberiaPersistirYEncontrarPorEmail() {
        User user = User.builder()
                .email("test@pathfinder.com")
                .name("Test User")
                .role(User.Role.STUDENT)
                .build();

        userRepository.save(user);

        var found = userRepository.findByEmail("test@pathfinder.com");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test User");
        assertThat(found.get().getRole()).isEqualTo(User.Role.STUDENT);
    }

    @Test
    void deberiaRetornarFalseSiEmailNoExiste() {
        assertThat(userRepository.existsByEmail("noexiste@mail.com")).isFalse();
    }
}
