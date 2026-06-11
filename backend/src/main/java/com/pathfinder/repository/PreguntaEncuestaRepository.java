package com.pathfinder.repository;

import com.pathfinder.model.entity.PreguntaEncuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PreguntaEncuestaRepository extends JpaRepository<PreguntaEncuesta, Integer> {
    List<PreguntaEncuesta> findByActivoTrueOrderByIdPreguntaAsc();
}
