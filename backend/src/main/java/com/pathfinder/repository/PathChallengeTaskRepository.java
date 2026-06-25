package com.pathfinder.repository;

import com.pathfinder.model.entity.PathChallengeTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

@Repository
public interface PathChallengeTaskRepository extends JpaRepository<PathChallengeTask, Integer> {
    List<PathChallengeTask> findByPathChallenge_IdPathChallengeOrderByOrdenAsc(Integer idPathChallenge);
    void deleteByPathChallenge_IdPathChallenge(Integer idPathChallenge);

    @Query("""
        SELECT t
        FROM PathChallengeTask t
        JOIN FETCH t.pathChallenge pc
        WHERE t.idPathChallengeTask = :idPathChallengeTask
          AND pc.idPathChallenge = :idPathChallenge
          AND t.activo = true
          AND pc.activo = true
        """)
    Optional<PathChallengeTask> findActiveTaskInChallenge(
            @Param("idPathChallengeTask") Integer idPathChallengeTask,
            @Param("idPathChallenge") Integer idPathChallenge
    );
}
