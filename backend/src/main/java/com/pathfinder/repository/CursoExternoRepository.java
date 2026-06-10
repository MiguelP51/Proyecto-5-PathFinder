package com.pathfinder.repository;

import com.pathfinder.model.entity.CursoExterno;
import com.pathfinder.model.enums.EstadoEnlace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.pathfinder.model.enums.NivelCurso;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface CursoExternoRepository extends JpaRepository<CursoExterno, Integer> {
    List<CursoExterno> findByEstadoEnlace(EstadoEnlace estadoEnlace);
    boolean existsByUrl(String url);
    long countByProveedorIdProveedor(Integer idProveedor);

    @EntityGraph(attributePaths = {"proveedor", "habilidad"})
    @Query("""
    SELECT c
        FROM CursoExterno c
        WHERE (:search IS NULL OR :search = ''
            OR LOWER(c.titulo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(c.proveedor.nombre) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:idHabilidad IS NULL OR c.habilidad.idHabilidad = :idHabilidad)
        AND (:nivel IS NULL OR c.nivel = :nivel)
        ORDER BY c.titulo ASC
    """)
    List<CursoExterno> buscarAdminSkillPaths(
            @Param("search") String search,
            @Param("idHabilidad") Integer idHabilidad,
            @Param("nivel") NivelCurso nivel
    ); 
}
