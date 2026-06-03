package com.pathfinder.repository;

import com.pathfinder.model.entity.Area;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AreaRepository extends JpaRepository<Area, Integer> {

    @EntityGraph(attributePaths = {"subareas"})
    List<Area> findByActivoTrueOrderByNombreAreaAsc();

    boolean existsByNombreAreaIgnoreCaseAndActivoTrue(String nombreArea);
}