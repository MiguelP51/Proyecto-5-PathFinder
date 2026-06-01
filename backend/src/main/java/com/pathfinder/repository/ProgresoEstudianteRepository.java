package com.pathfinder.repository;

import com.pathfinder.model.entity.ProgresoEstudiante;
import com.pathfinder.model.enums.NombreEtapa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgresoEstudianteRepository extends JpaRepository<ProgresoEstudiante, Integer> {

    List<ProgresoEstudiante> findByUsuario_IdUsuario(Integer idUsuario);

    Optional<ProgresoEstudiante> findByUsuario_IdUsuarioAndNombreEtapa(
            Integer idUsuario, NombreEtapa nombreEtapa);
}