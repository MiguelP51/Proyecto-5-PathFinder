package com.pathfinder.repository;

import com.pathfinder.model.entity.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AreaRepository extends JpaRepository<Area, String> {
    List<Area> findByActivoTrue();
    Optional<Area> findByIdAreaAndActivoTrue(String idArea);
}
