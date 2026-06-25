package com.pathfinder.repository;

import com.pathfinder.model.entity.AreaEntrevista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AreaEntrevistaRepository extends JpaRepository<AreaEntrevista, Integer> {
    List<AreaEntrevista> findByActivoTrueOrderByNombreAsc();
    List<AreaEntrevista> findAllByOrderByNombreAsc();
    Optional<AreaEntrevista> findByNombre(String nombre);
}
