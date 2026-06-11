package com.pathfinder.service.impl;

import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.enums.RolUsuario;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public Optional<Usuario> findByCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }

    @Override
    public Usuario getCurrentUser(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + correo));
    }

    @Override
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @Override
    @Transactional
    public Usuario actualizarRolUsuario(Integer idUsuario, RolUsuario nuevoRol, String correoAdminActual) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + idUsuario));

        if (usuario.getCorreo().equalsIgnoreCase(correoAdminActual)
                && nuevoRol != RolUsuario.ADMIN) {
            throw new IllegalStateException("No puedes quitarte tu propio rol de administrador");
        }

        usuario.setRol(nuevoRol);
        usuario.setFechaModificacion(LocalDateTime.now());

        return usuarioRepository.save(usuario);
    }
}
