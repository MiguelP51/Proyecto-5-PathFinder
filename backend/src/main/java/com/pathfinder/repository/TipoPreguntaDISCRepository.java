package com.pathfinder.repository;

import com.pathfinder.model.entity.TipoPreguntaDISC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TipoPreguntaDISCRepository extends JpaRepository<TipoPreguntaDISC, Integer> {

    Optional<TipoPreguntaDISC> findByCodigoAndActivoTrue(String codigo);
}