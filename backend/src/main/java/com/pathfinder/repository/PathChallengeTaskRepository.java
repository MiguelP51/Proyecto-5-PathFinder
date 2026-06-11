package com.pathfinder.repository;

import com.pathfinder.model.entity.PathChallengeTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PathChallengeTaskRepository extends JpaRepository<PathChallengeTask, Integer> {
    List<PathChallengeTask> findByPathChallenge_IdPathChallengeOrderByOrdenAsc(Integer idPathChallenge);
    void deleteByPathChallenge_IdPathChallenge(Integer idPathChallenge);
}
