package com.pathfinder.repository;

import com.pathfinder.model.entity.HerramientaDigital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HerramientaDigitalRepository extends JpaRepository<HerramientaDigital, Integer> {
    Optional<HerramientaDigital> findByNombreHerramientaIgnoreCase(String nombre);
}
