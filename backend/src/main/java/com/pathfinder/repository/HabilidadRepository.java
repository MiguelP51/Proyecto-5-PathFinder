package com.pathfinder.repository;

import com.pathfinder.model.entity.Habilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HabilidadRepository extends JpaRepository<Habilidad, Integer> {
    Optional<Habilidad> findByNombreHabilidadIgnoreCase(String nombre);
}
