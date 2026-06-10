package com.pathfinder.repository;

import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.enums.RolUsuario;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void deberiaPersistirYEncontrarPorEmail() {
        Usuario usuario = new Usuario();
        usuario.setCorreo("test@pathfinder.com");
        usuario.setNombreCompleto("Test User");
        usuario.setRol(RolUsuario.USER);

        usuarioRepository.save(usuario);

        var found = usuarioRepository.findByCorreo("test@pathfinder.com");
        assertThat(found).isPresent();
        assertThat(found.get().getNombreCompleto()).isEqualTo("Test User");
        assertThat(found.get().getRol()).isEqualTo(RolUsuario.USER);
    }

    @Test
    void deberiaRetornarFalseSiEmailNoExiste() {
        assertThat(usuarioRepository.existsByCorreo("noexiste@mail.com")).isFalse();
    }
}
