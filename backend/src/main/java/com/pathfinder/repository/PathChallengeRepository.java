package com.pathfinder.repository;

import com.pathfinder.model.entity.PathChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PathChallengeRepository extends JpaRepository<PathChallenge, Integer> {
}
