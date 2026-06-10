package com.pathfinder.repository;

import com.pathfinder.model.entity.Feriado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface FeriadoRepository extends JpaRepository<Feriado, Integer> {
    boolean existsByFechaAndActivoTrue(LocalDate fecha);
}
