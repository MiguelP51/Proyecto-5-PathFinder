package com.pathfinder.repository;

import com.pathfinder.model.entity.ConfiguracionDISC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracionDISCRepository extends JpaRepository<ConfiguracionDISC, Integer> {

    Optional<ConfiguracionDISC> findFirstByActivoTrueOrderByFechaInicioVigenciaDesc();
}