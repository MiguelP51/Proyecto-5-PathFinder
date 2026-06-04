package com.pathfinder.repository;

import com.pathfinder.model.entity.ConfiguracionDisponibilidadMentor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracionDisponibilidadMentorRepository extends JpaRepository<ConfiguracionDisponibilidadMentor, Integer> {

    Optional<ConfiguracionDisponibilidadMentor> findByMentor_IdUsuarioAndActivoTrue(Integer idMentor);

    Optional<ConfiguracionDisponibilidadMentor> findByMentor_CorreoAndActivoTrue(String correoMentor);
}
