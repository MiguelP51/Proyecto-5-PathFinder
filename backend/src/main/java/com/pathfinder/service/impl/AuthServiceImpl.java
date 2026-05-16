package com.pathfinder.service.impl;

import com.pathfinder.dto.auth.LoginRequestDTO;
import com.pathfinder.dto.auth.UsuarioAuthResponseDTO;
import com.pathfinder.model.entity.SesionAutenticacion;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.enums.EstadoSesion;
import com.pathfinder.model.enums.RolUsuario;
import com.pathfinder.repository.SesionAutenticacionRepository;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.service.AuthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final SesionAutenticacionRepository sesionAutenticacionRepository;

    @Override
    @Transactional
    public UsuarioAuthResponseDTO login(LoginRequestDTO request) {
        validarRequest(request);

        String correoNormalizado = request.getCorreo().trim().toLowerCase();

        Optional<Usuario> usuarioOptional = usuarioRepository.findByCorreo(correoNormalizado);
        boolean nuevoUsuario = usuarioOptional.isEmpty();

        Usuario usuario = usuarioOptional
                .map(usuarioExistente -> actualizarUsuario(usuarioExistente, request))
                .orElseGet(() -> crearUsuario(request, correoNormalizado));

        registrarSesionExitosa(usuario);

        return new UsuarioAuthResponseDTO(
                usuario.getIdUsuario(),
                usuario.getCorreo(),
                usuario.getNombreCompleto(),
                usuario.getAvatarUrl(),
                usuario.getRol(),
                nuevoUsuario,
                nuevoUsuario
        );
    }

    private void validarRequest(LoginRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("La solicitud no puede estar vacía");
        }

        if (!StringUtils.hasText(request.getCorreo())) {
            throw new IllegalArgumentException("El correo es obligatorio");
        }
    }

    private Usuario crearUsuario(LoginRequestDTO request, String correoNormalizado) {
        Usuario usuario = new Usuario();
        usuario.setCorreo(correoNormalizado);
        usuario.setNombreCompleto(normalizarTexto(request.getNombreCompleto()));
        usuario.setAvatarUrl(normalizarTexto(request.getAvatarUrl()));
        usuario.setRol(RolUsuario.USER);
        usuario.setActivo(true);

        return usuarioRepository.save(usuario);
    }

    private Usuario actualizarUsuario(Usuario usuario, LoginRequestDTO request) {
        if (StringUtils.hasText(request.getNombreCompleto())) {
            usuario.setNombreCompleto(request.getNombreCompleto().trim());
        }

        if (StringUtils.hasText(request.getAvatarUrl())) {
            usuario.setAvatarUrl(request.getAvatarUrl().trim());
        }

        if (usuario.getRol() == null) {
            usuario.setRol(RolUsuario.USER);
        }

        if (usuario.getActivo() == null) {
            usuario.setActivo(true);
        }

        usuario.setFechaModificacion(LocalDateTime.now());

        return usuarioRepository.save(usuario);
    }

    private void registrarSesionExitosa(Usuario usuario) {
        SesionAutenticacion sesion = new SesionAutenticacion();
        sesion.setUsuario(usuario);
        sesion.setFechaInicio(LocalDateTime.now());
        sesion.setEstadoSesion(EstadoSesion.EXITOSA);
        sesion.setActivo(true);

        sesionAutenticacionRepository.save(sesion);
    }

    private String normalizarTexto(String valor) {
        return StringUtils.hasText(valor) ? valor.trim() : null;
    }
}