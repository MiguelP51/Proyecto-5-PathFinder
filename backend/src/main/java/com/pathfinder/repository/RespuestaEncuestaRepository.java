package com.pathfinder.repository;

import com.pathfinder.model.entity.RespuestaEncuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RespuestaEncuestaRepository extends JpaRepository<RespuestaEncuesta, Integer> {
    boolean existsByEstudiante_Correo(String correo);
    List<RespuestaEncuesta> findByEstudiante_Correo(String correo);
    boolean existsByEntrevista_IdEntrevista(Integer idEntrevista);
    List<RespuestaEncuesta> findByEntrevista_IdEntrevista(Integer idEntrevista);
    List<RespuestaEncuesta> findByEntrevista_Mentor_IdUsuario(Integer idMentor);
}
