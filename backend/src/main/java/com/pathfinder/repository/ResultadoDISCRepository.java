package com.pathfinder.repository;

import com.pathfinder.model.entity.ResultadoDISC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResultadoDISCRepository extends JpaRepository<ResultadoDISC, Integer> {
    Optional<ResultadoDISC> findFirstByUsuario_CorreoOrderByFechaFinalizacionDesc(String correo);
    Optional<ResultadoDISC> findFirstByUsuario_IdUsuarioOrderByFechaFinalizacionDesc(Integer idUsuario);
}
