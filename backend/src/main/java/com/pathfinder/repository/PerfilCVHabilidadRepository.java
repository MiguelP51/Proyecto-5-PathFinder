package com.pathfinder.repository;

import com.pathfinder.model.entity.PerfilCVHabilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerfilCVHabilidadRepository extends JpaRepository<PerfilCVHabilidad, Integer> {
    List<PerfilCVHabilidad> findByPerfilCv_IdPerfilCv(Integer idPerfilCv);
    void deleteByPerfilCv_IdPerfilCv(Integer idPerfilCv);
}
