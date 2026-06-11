package com.pathfinder.repository;

import com.pathfinder.model.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {

    List<Notificacion> findByUsuario_CorreoOrderByFechaCreacionDesc(String correo);

    List<Notificacion> findTop10ByUsuario_CorreoOrderByFechaCreacionDesc(String correo);

    int countByUsuario_CorreoAndLeidaFalse(String correo);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leida = true WHERE n.usuario.correo = :correo AND n.leida = false")
    int marcarTodasComoLeidas(@Param("correo") String correo);
}
