package com.pathfinder.service.impl;

import com.pathfinder.dto.auth.LoginRequestDTO;
import com.pathfinder.dto.auth.LoginResponseDTO;
import com.pathfinder.dto.auth.UsuarioAuthResponseDTO;
import com.pathfinder.model.entity.SesionAutenticacion;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.enums.EstadoSesion;
import com.pathfinder.model.enums.RolUsuario;
import com.pathfinder.repository.SesionAutenticacionRepository;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.security.jwt.JwtTokenProvider;
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
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public LoginResponseDTO login(LoginRequestDTO request) {
        validarRequest(request);

        String correoNormalizado = request.getCorreo().trim().toLowerCase();
        String googleUidNormalizado = normalizarTexto(request.getGoogleUid());

        Usuario usuario = buscarUsuario(googleUidNormalizado, correoNormalizado)
                .map(usuarioExistente -> actualizarUsuario(usuarioExistente, request, correoNormalizado, googleUidNormalizado))
                .orElseGet(() -> crearUsuario(request, correoNormalizado, googleUidNormalizado));

        registrarSesionExitosa(usuario);

        String token = jwtTokenProvider.generateToken(usuario.getCorreo());

        UsuarioAuthResponseDTO usuarioDTO = new UsuarioAuthResponseDTO(
                usuario.getIdUsuario(),
                usuario.getGoogleUid(),
                usuario.getNombreCompleto(),
                usuario.getCorreo(),
                usuario.getAvatarUrl(),
                usuario.getRol()
        );

        return new LoginResponseDTO(token, "Bearer", usuarioDTO);
    }

    private void validarRequest(LoginRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("La solicitud de login no puede estar vacía");
        }

        if (!StringUtils.hasText(request.getCorreo())) {
            throw new IllegalArgumentException("El correo es obligatorio");
        }

        if (!StringUtils.hasText(request.getGoogleUid())) {
            throw new IllegalArgumentException("El googleUid es obligatorio");
        }
    }

    private Optional<Usuario> buscarUsuario(String googleUid, String correo) {
        if (StringUtils.hasText(googleUid)) {
            Optional<Usuario> usuarioPorGoogleUid = usuarioRepository.findByGoogleUid(googleUid);
            if (usuarioPorGoogleUid.isPresent()) {
                return usuarioPorGoogleUid;
            }
        }

        return usuarioRepository.findByCorreo(correo);
    }

    private Usuario crearUsuario(LoginRequestDTO request, String correo, String googleUid) {
        Usuario usuario = new Usuario();
        usuario.setGoogleUid(googleUid);
        usuario.setCorreo(correo);
        usuario.setNombreCompleto(normalizarTexto(request.getNombreCompleto()));
        usuario.setAvatarUrl(normalizarTexto(request.getAvatarUrl()));
        usuario.setRol(RolUsuario.USER);
        usuario.setActivo(true);

        return usuarioRepository.save(usuario);
    }

    private Usuario actualizarUsuario(
            Usuario usuario,
            LoginRequestDTO request,
            String correo,
            String googleUid
    ) {
        usuario.setCorreo(correo);
        usuario.setGoogleUid(googleUid);
        usuario.setNombreCompleto(normalizarTexto(request.getNombreCompleto()));
        usuario.setAvatarUrl(normalizarTexto(request.getAvatarUrl()));
        usuario.setFechaModificacion(LocalDateTime.now());

        if (usuario.getRol() == null) {
            usuario.setRol(RolUsuario.USER);
        }

        if (usuario.getActivo() == null) {
            usuario.setActivo(true);
        }

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