package com.pathfinder.repository;

import com.pathfinder.model.entity.CursoExterno;
import com.pathfinder.model.enums.EstadoEnlace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CursoExternoRepository extends JpaRepository<CursoExterno, Integer> {
    List<CursoExterno> findByEstadoEnlace(EstadoEnlace estadoEnlace);
    boolean existsByUrl(String url);
    long countByProveedorIdProveedor(Integer idProveedor);
}
