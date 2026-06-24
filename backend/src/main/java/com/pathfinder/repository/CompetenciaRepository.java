package com.pathfinder.repository;

import com.pathfinder.model.entity.Competencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompetenciaRepository extends JpaRepository<Competencia, Integer> {
    List<Competencia> findByPuestoIgnoreCase(String puesto);
}
