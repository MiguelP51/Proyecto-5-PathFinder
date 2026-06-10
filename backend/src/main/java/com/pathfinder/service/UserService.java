package com.pathfinder.service;

import com.pathfinder.model.entity.Usuario;

import java.util.Optional;

public interface UserService {
    Optional<Usuario> findByCorreo(String correo);
    Usuario getCurrentUser(String email);
}
