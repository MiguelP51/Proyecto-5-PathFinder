package com.pathfinder.repository;

import com.pathfinder.model.entity.PerfilCVHerramienta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerfilCVHerramientaRepository extends JpaRepository<PerfilCVHerramienta, Integer> {
    List<PerfilCVHerramienta> findByPerfilCv_IdPerfilCv(Integer idPerfilCv);
    void deleteByPerfilCv_IdPerfilCv(Integer idPerfilCv);
}
