package com.pathfinder.repository;

import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.enums.RolUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByCorreo(String correo);
    Optional<Usuario> findByGoogleUid(String googleUid);
    boolean existsByCorreo(String correo);
    List<Usuario> findByRolAndActivoTrue(RolUsuario rol);
}
