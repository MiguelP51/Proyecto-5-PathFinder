package com.pathfinder.repository;

import com.pathfinder.model.entity.EvidenciaSkillPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EvidenciaSkillPathRepository extends JpaRepository<EvidenciaSkillPath, Integer> {

    Optional<EvidenciaSkillPath> findTopByUsuarioSkillPath_IdUsuarioSkillPathOrderByFechaSubidaDesc(
            Integer idUsuarioSkillPath
    );

    void deleteByUsuarioSkillPath_IdUsuarioSkillPath(
            Integer idUsuarioSkillPath
    );
}