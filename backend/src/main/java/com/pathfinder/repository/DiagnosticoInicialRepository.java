package com.pathfinder.repository;

import com.pathfinder.model.entity.DiagnosticoInicial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DiagnosticoInicialRepository extends JpaRepository<DiagnosticoInicial, Integer> {
    Optional<DiagnosticoInicial> findByUsuario_IdUsuarioAndSubArea_IdSubareaAndEstado(
        Integer idUsuario, Integer idSubarea, String estado);
    Optional<DiagnosticoInicial> findTopByUsuario_IdUsuarioAndSubArea_IdSubareaOrderByFechaInicioDesc(
        Integer idUsuario, Integer idSubarea);
}
