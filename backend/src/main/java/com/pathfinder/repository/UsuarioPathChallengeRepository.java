package com.pathfinder.repository;

import com.pathfinder.model.entity.UsuarioPathChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;



import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioPathChallengeRepository extends JpaRepository<UsuarioPathChallenge, Integer> {

    Optional<UsuarioPathChallenge> findByUsuario_CorreoAndPathChallenge_IdPathChallengeAndActivoTrue(
            String correo,
            Integer idPathChallenge
    );

    List<UsuarioPathChallenge> findByUsuario_CorreoAndPathChallenge_IdPathChallengeInAndActivoTrue(
            String correo,
            Collection<Integer> idsPathChallenge
    );

    Optional<UsuarioPathChallenge> findByUsuario_IdUsuarioAndPathChallenge_IdPathChallengeAndActivoTrue(
            Integer idUsuario,
            Integer idPathChallenge
    );

    @Query("""
        SELECT DISTINCT upc
        FROM UsuarioPathChallenge upc
        JOIN FETCH upc.pathChallenge pc
        LEFT JOIN FETCH pc.habilidades h
        LEFT JOIN FETCH pc.subArea s
        WHERE upc.usuario.correo = :correo
          AND upc.activo = true
          AND pc.activo = true
        ORDER BY upc.fechaUltimoAvance DESC
        """)
    List<UsuarioPathChallenge> findIniciadosByUsuarioCorreo(
            @Param("correo") String correo
    );

    List<UsuarioPathChallenge> findByUsuario_IdUsuarioAndActivoTrue(Integer idUsuario);
}