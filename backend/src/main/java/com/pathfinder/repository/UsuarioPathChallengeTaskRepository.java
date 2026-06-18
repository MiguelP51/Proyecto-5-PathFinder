package com.pathfinder.repository;

import com.pathfinder.model.entity.UsuarioPathChallengeTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioPathChallengeTaskRepository extends JpaRepository<UsuarioPathChallengeTask, Integer> {

    List<UsuarioPathChallengeTask> findByUsuarioPathChallenge_IdUsuarioPathChallenge(
            Integer idUsuarioPathChallenge
    );

    Optional<UsuarioPathChallengeTask> findByUsuarioPathChallenge_IdUsuarioPathChallengeAndPathChallengeTask_IdPathChallengeTask(
            Integer idUsuarioPathChallenge,
            Integer idPathChallengeTask
    );

    long countByUsuarioPathChallenge_IdUsuarioPathChallengeAndCompletadaTrue(
            Integer idUsuarioPathChallenge
    );

    void deleteByUsuarioPathChallenge_IdUsuarioPathChallenge(
            Integer idUsuarioPathChallenge
    );
}