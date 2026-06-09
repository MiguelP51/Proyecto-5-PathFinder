package com.pathfinder.repository;

import com.pathfinder.model.entity.VisitaSubArea;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VisitaSubAreaRepository extends JpaRepository<VisitaSubArea, Integer> {
    Optional<VisitaSubArea> findByUsuario_IdUsuarioAndSubArea_IdSubarea(
        Integer idUsuario, Integer idSubarea);
}