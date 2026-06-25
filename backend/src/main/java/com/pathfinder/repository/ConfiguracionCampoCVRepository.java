package com.pathfinder.repository;

import com.pathfinder.model.entity.ConfiguracionCampoCV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConfiguracionCampoCVRepository extends JpaRepository<ConfiguracionCampoCV, Integer> {
    List<ConfiguracionCampoCV> findByActivoTrueOrderByOrdenAsc();
    List<ConfiguracionCampoCV> findAllByOrderByOrdenAsc();
    Optional<ConfiguracionCampoCV> findByClave(String clave);
    boolean existsByClave(String clave);
}
