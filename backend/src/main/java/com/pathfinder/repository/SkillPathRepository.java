package com.pathfinder.repository;

import com.pathfinder.model.entity.SkillPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillPathRepository extends JpaRepository<SkillPath, Integer> {
    List<SkillPath> findByUsuario_CorreoAndEstado(String correo, String estado);
    List<SkillPath> findByUsuario_Correo(String correo);
}
