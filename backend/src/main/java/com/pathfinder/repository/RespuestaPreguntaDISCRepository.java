package com.pathfinder.repository;

import com.pathfinder.model.entity.RespuestaPreguntaDISC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RespuestaPreguntaDISCRepository extends JpaRepository<RespuestaPreguntaDISC, Integer> {
    List<RespuestaPreguntaDISC> findByUsuario_IdUsuario(Integer idUsuario);
}
