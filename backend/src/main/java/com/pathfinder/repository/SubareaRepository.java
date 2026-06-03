package com.pathfinder.repository;

import com.pathfinder.model.entity.Subarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubareaRepository extends JpaRepository<Subarea, Integer> {

    List<Subarea> findByAreaIdAreaAndActivoTrueOrderByNombreSubareaAsc(Integer idArea);

    boolean existsByAreaIdAreaAndNombreSubareaIgnoreCaseAndActivoTrue(Integer idArea, String nombreSubarea);
}