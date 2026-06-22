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

    List<SkillPath> findByUsuarioIsNull();
    List<SkillPath> findByUsuarioIsNotNull();

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

    List<SkillPath> findByUsuarioIsNullAndActivoTrueAndEstadoPublicacion(String estadoPublicacion);

    List<SkillPath> findByUsuarioIsNullAndSubareaIdAndActivoTrueAndEstadoPublicacion(
            String subareaId,
            String estadoPublicacion
    );

    Optional<SkillPath> findByIdSkillPathAndUsuarioIsNullAndActivoTrueAndEstadoPublicacionIn(
            Integer idSkillPath,
            java.util.Collection<String> estadosPublicacion
    );
    Optional<SkillPath> findByIdSkillPathAndUsuarioIsNullAndActivoTrueAndEstadoPublicacion(
        Integer idSkillPath,
        String estadoPublicacion
    );

    List<SkillPath> findByAreaId(String areaId);
    List<SkillPath> findBySubareaId(String subareaId);
}
