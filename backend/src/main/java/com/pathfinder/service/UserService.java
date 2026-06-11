package com.pathfinder.service;

import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.enums.RolUsuario;

import java.util.List;
import java.util.Optional;

public interface UserService {
    Optional<Usuario> findByCorreo(String correo);
    Usuario getCurrentUser(String email);

    List<Usuario> listarUsuarios();
    Usuario actualizarRolUsuario(Integer idUsuario, RolUsuario nuevoRol, String correoAdminActual);
}