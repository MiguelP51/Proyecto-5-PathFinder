package com.pathfinder.repository;

import com.pathfinder.model.entity.SubArea;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubAreaRepository extends JpaRepository<SubArea, Integer> {
    List<SubArea> findByActivoTrue();
    List<SubArea> findByAreaIdAndActivoTrue(String areaId);
    Optional<SubArea> findByIdSubareaAndActivoTrue(Integer idSubarea);
}
