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

    // Nuevo: usado para migrar /api/skillpaths/activos al modelo de UsuarioSkillPath
    @Query("""
        SELECT usp
        FROM UsuarioSkillPath usp
        JOIN FETCH usp.skillPath sp
        WHERE usp.usuario.correo = :correo
          AND usp.estado = :estado
          AND sp.activo = true
        ORDER BY usp.fechaRegistro DESC
        """)
    List<UsuarioSkillPath> findByUsuarioCorreoAndEstado(
            @Param("correo") String correo,
            @Param("estado") String estado
    );
}