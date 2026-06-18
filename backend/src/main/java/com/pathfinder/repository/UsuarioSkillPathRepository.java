package com.pathfinder.repository;

import com.pathfinder.model.entity.UsuarioSkillPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioSkillPathRepository extends JpaRepository<UsuarioSkillPath, Integer> {

    Optional<UsuarioSkillPath> findByUsuario_CorreoAndSkillPath_IdSkillPath(
            String correo,
            Integer idSkillPath
    );

    List<UsuarioSkillPath> findByUsuario_CorreoAndSkillPath_IdSkillPathIn(
            String correo,
            Collection<Integer> idsSkillPath
    );

    @Query("""
        SELECT usp
        FROM UsuarioSkillPath usp
        JOIN FETCH usp.skillPath sp
        WHERE usp.usuario.correo = :correo
          AND sp.activo = true
        ORDER BY usp.fechaRegistro DESC
        """)
    List<UsuarioSkillPath> findSkillPathsIniciadosByUsuarioCorreo(
            @Param("correo") String correo
    );

    @Query("""
        SELECT usp
        FROM UsuarioSkillPath usp
        JOIN FETCH usp.skillPath sp
        WHERE usp.usuario.idUsuario = :idUsuario
        ORDER BY usp.fechaRegistro DESC
        """)
    List<UsuarioSkillPath> findByUsuarioIdWithSkillPath(
            @Param("idUsuario") Integer idUsuario
    );
}
