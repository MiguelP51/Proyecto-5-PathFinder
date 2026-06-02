package com.pathfinder.repository;

import com.pathfinder.model.entity.PreguntaDISC;
import com.pathfinder.model.enums.CategoriaDISC;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreguntaDISCRepository extends JpaRepository<PreguntaDISC, Integer> {

    @EntityGraph(attributePaths = {"tipoPreguntaDisc", "opciones"})
    List<PreguntaDISC> findByActivoTrueOrderByOrdenPreguntaAsc();

    @EntityGraph(attributePaths = {"tipoPreguntaDisc", "opciones"})
    List<PreguntaDISC> findByCategoriaDiscAndActivoTrueOrderByOrdenPreguntaAsc(CategoriaDISC categoriaDisc);

    Long countByActivoTrue();

    Long countByCategoriaDiscAndActivoTrue(CategoriaDISC categoriaDisc);
}