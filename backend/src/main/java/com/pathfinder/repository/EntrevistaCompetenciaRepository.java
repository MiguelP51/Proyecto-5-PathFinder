package com.pathfinder.repository;

import com.pathfinder.model.entity.EntrevistaCompetencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntrevistaCompetenciaRepository extends JpaRepository<EntrevistaCompetencia, Integer> {
    List<EntrevistaCompetencia> findByEntrevista_IdEntrevista(Integer idEntrevista);
}
