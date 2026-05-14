package com.pathfinder.repository;

import com.pathfinder.model.entity.PerfilCV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PerfilCVRepository extends JpaRepository<PerfilCV, Integer> {
    Optional<PerfilCV> findByUsuario_IdUsuario(Integer idUsuario);
    Optional<PerfilCV> findByUsuario_Correo(String correo);
}
