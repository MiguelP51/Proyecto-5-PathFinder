package com.pathfinder.repository;

import com.pathfinder.model.entity.Insignia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsigniaRepository extends JpaRepository<Insignia, Integer> {
    List<Insignia> findByUsuario_CorreoOrderByFechaRegistroDesc(String correo);
}
