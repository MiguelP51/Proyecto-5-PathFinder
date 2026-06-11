package com.pathfinder.repository;

import com.pathfinder.model.entity.PreguntaDiagnostico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PreguntaDiagnosticoRepository extends JpaRepository<PreguntaDiagnostico, Integer> {
    List<PreguntaDiagnostico> findBySubArea_IdSubareaAndActivoTrueOrderByOrdenAsc(Integer idSubarea);
}
