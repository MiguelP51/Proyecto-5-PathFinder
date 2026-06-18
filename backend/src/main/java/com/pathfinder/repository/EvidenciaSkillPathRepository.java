package com.pathfinder.repository;

import com.pathfinder.model.entity.EvidenciaSkillPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EvidenciaSkillPathRepository extends JpaRepository<EvidenciaSkillPath, Integer> {

    Optional<EvidenciaSkillPath> findTopByUsuarioSkillPath_IdUsuarioSkillPathAndActivoTrueOrderByFechaSubidaDesc(
            Integer idUsuarioSkillPath
    );

    List<EvidenciaSkillPath> findByUsuarioSkillPath_IdUsuarioSkillPathAndActivoTrue(
            Integer idUsuarioSkillPath
    );

    @Modifying
    @Query("""
       UPDATE EvidenciaSkillPath e
       SET e.activo = false
       WHERE e.usuarioSkillPath.idUsuarioSkillPath = :idUsuarioSkillPath
       """)
    void desactivarByUsuarioSkillPathId(
            @Param("idUsuarioSkillPath") Integer idUsuarioSkillPath
    );
}