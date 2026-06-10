package com.pathfinder.repository;

import com.pathfinder.model.entity.UsuarioSkillPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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
}