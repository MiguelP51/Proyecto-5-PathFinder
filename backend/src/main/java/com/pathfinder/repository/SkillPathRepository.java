package com.pathfinder.repository;

import com.pathfinder.model.entity.SkillPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillPathRepository extends JpaRepository<SkillPath, Integer> {
    List<SkillPath> findByUsuario_CorreoAndEstado(String correo, String estado);
    List<SkillPath> findByUsuario_Correo(String correo);

    List<SkillPath> findByUsuario_CorreoAndActivoTrue(String correo);

    List<SkillPath> findByUsuario_CorreoAndSubareaIdAndActivoTrue(
            String correo,
            String subareaId
    );

    Optional<SkillPath> findByIdSkillPathAndUsuario_CorreoAndActivoTrue(
            Integer idSkillPath,
            String correo
    );

    List<SkillPath> findByUsuarioIsNullAndActivoTrue();

    List<SkillPath> findByUsuarioIsNullAndSubareaIdAndActivoTrue(
            String subareaId
    );

    Optional<SkillPath> findByIdSkillPathAndUsuarioIsNullAndActivoTrue(
            Integer idSkillPath
    );
}
