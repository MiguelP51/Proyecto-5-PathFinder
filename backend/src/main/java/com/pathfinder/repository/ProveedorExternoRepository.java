package com.pathfinder.repository;

import com.pathfinder.model.entity.ProveedorExterno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProveedorExternoRepository extends JpaRepository<ProveedorExterno, Integer> {
    Optional<ProveedorExterno> findByNombreIgnoreCase(String nombre);
}
