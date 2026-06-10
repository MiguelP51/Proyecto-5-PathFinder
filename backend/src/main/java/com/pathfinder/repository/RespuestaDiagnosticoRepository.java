package com.pathfinder.repository;

import com.pathfinder.model.entity.RespuestaDiagnostico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RespuestaDiagnosticoRepository extends JpaRepository<RespuestaDiagnostico, Integer> {
    List<RespuestaDiagnostico> findByDiagnostico_IdDiagnostico(Integer idDiagnostico);
}
