package com.pathfinder.repository;

import com.pathfinder.model.entity.SesionAutenticacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SesionAutenticacionRepository extends JpaRepository<SesionAutenticacion, Integer> {
}