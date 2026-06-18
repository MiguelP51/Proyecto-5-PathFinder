package com.pathfinder.repository;

import com.pathfinder.model.entity.UsuarioPathChallengeTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioPathChallengeTaskRepository extends JpaRepository<UsuarioPathChallengeTask, Integer> {

    List<UsuarioPathChallengeTask> findByUsuarioPathChallenge_IdUsuarioPathChallengeAndActivoTrue(
            Integer idUsuarioPathChallenge
    );

    Optional<UsuarioPathChallengeTask> findByUsuarioPathChallenge_IdUsuarioPathChallengeAndPathChallengeTask_IdPathChallengeTaskAndActivoTrue(
            Integer idUsuarioPathChallenge,
            Integer idPathChallengeTask
    );

    long countByUsuarioPathChallenge_IdUsuarioPathChallengeAndCompletadaTrueAndActivoTrue(
            Integer idUsuarioPathChallenge
    );

    @Modifying
    @Query("""
       UPDATE UsuarioPathChallengeTask t
       SET t.activo = false
       WHERE t.usuarioPathChallenge.idUsuarioPathChallenge = :idUsuarioPathChallenge
       """)
    void desactivarByUsuarioPathChallengeId(
            @Param("idUsuarioPathChallenge") Integer idUsuarioPathChallenge
    );
}