package com.pathfinder.repository;

import com.pathfinder.model.entity.DisponibilidadMentor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DisponibilidadMentorRepository extends JpaRepository<DisponibilidadMentor, Integer> {
    List<DisponibilidadMentor> findByMentor_CorreoAndActivoTrue(String correo);
    List<DisponibilidadMentor> findByMentor_IdUsuarioAndActivoTrue(Integer idUsuario);
    List<DisponibilidadMentor> findByActivoTrue();
}
