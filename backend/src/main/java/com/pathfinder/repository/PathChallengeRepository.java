package com.pathfinder.repository;

import com.pathfinder.model.entity.PathChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PathChallengeRepository extends JpaRepository<PathChallenge, Integer> {

    @Query("""
            SELECT DISTINCT pc
            FROM PathChallenge pc
            LEFT JOIN FETCH pc.habilidades h
            WHERE pc.subArea.idSubarea = :idSubarea
              AND LOWER(pc.estado) = 'publicada'
            ORDER BY pc.idPathChallenge ASC
            """)
    List<PathChallenge> findPublicadosBySubAreaWithHabilidades(
            @Param("idSubarea") Integer idSubarea
    );

    @Query("""
            SELECT DISTINCT pc
            FROM PathChallenge pc
            LEFT JOIN FETCH pc.habilidades h
            WHERE pc.idPathChallenge = :idPathChallenge
              AND LOWER(pc.estado) = 'publicada'
            """)
    Optional<PathChallenge> findPublicadoByIdWithHabilidades(
            @Param("idPathChallenge") Integer idPathChallenge
    );
}