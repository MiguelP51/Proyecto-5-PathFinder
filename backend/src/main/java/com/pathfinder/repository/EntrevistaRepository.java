package com.pathfinder.repository;

import com.pathfinder.model.entity.Entrevista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EntrevistaRepository extends JpaRepository<Entrevista, Integer> {
    List<Entrevista> findByEstudiante_CorreoAndActivoTrue(String correo);
    List<Entrevista> findByMentor_CorreoAndActivoTrue(String correo);
    List<Entrevista> findByMentor_Correo(String correo);
    List<Entrevista> findByMentor_IdUsuarioAndFechaAndActivoTrue(Integer idUsuario, LocalDate fecha);
    
    Optional<Entrevista> findFirstByEstudiante_CorreoAndActivoTrueOrderByFechaDescHoraDesc(String correo);
    Optional<Entrevista> findFirstByEstudiante_IdUsuarioAndActivoTrueOrderByFechaDescHoraDesc(Integer idUsuario);
    
    boolean existsByEstudiante_IdUsuarioAndEstadoAndActivoTrue(Integer idUsuario, String estado);
    boolean existsByMentor_IdUsuarioAndFechaAndHoraAndActivoTrue(Integer mentorId, LocalDate fecha, String hora);
}
