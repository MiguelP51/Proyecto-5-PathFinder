package com.pathfinder.repository;

import com.pathfinder.model.entity.OpcionPreguntaDISC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpcionPreguntaDISCRepository extends JpaRepository<OpcionPreguntaDISC, Integer> {

    List<OpcionPreguntaDISC> findByPreguntaDiscIdPreguntaDiscAndActivoTrueOrderByOrdenOpcionAsc(Integer idPreguntaDisc);
}