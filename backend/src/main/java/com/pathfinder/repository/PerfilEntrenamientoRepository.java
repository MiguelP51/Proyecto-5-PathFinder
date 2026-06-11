package com.pathfinder.repository;

import com.pathfinder.model.entity.PerfilEntrenamiento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PerfilEntrenamientoRepository extends JpaRepository<PerfilEntrenamiento, Integer> {
    Optional<PerfilEntrenamiento> findByUsuario_Correo(String correo);
    Optional<PerfilEntrenamiento> findByUsuario_IdUsuario(Integer idUsuario);
}
