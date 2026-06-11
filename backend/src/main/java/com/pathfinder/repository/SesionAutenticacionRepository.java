package com.pathfinder.repository;

import com.pathfinder.model.entity.SesionAutenticacion;
import com.pathfinder.model.enums.EstadoSesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SesionAutenticacionRepository extends JpaRepository<SesionAutenticacion, Integer> {
    Optional<SesionAutenticacion> findFirstByUsuario_CorreoAndEstadoSesionAndFechaFinIsNullAndActivoTrueOrderByFechaInicioDesc(String correo, EstadoSesion estadoSesion);
}