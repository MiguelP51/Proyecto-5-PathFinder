package com.pathfinder.repository;

import com.pathfinder.model.entity.PuestoEntrevista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PuestoEntrevistaRepository extends JpaRepository<PuestoEntrevista, Integer> {
    List<PuestoEntrevista> findByArea_IdAreaAndActivoTrueOrderByNombreAsc(Integer idArea);
    List<PuestoEntrevista> findByArea_IdAreaOrderByNombreAsc(Integer idArea);
    List<PuestoEntrevista> findByActivoTrueOrderByNombreAsc();
    boolean existsByArea_IdAreaAndNombreIgnoreCase(Integer idArea, String nombre);
    java.util.Optional<PuestoEntrevista> findFirstByNombreIgnoreCase(String nombre);
}
