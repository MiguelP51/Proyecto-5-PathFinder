package com.pathfinder.repository;

import com.pathfinder.model.entity.EvidenciaSkillPath;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EvidenciaSkillPathRepository extends JpaRepository<EvidenciaSkillPath, Integer> {

    Optional<EvidenciaSkillPath> findTopByUsuarioSkillPath_IdUsuarioSkillPathOrderByFechaSubidaDesc(
            Integer idUsuarioSkillPath
    );

    List<EvidenciaSkillPath> findByUsuarioSkillPath_IdUsuarioSkillPath(
            Integer idUsuarioSkillPath
    );

    void deleteByUsuarioSkillPath_IdUsuarioSkillPath(
            Integer idUsuarioSkillPath
    );
}