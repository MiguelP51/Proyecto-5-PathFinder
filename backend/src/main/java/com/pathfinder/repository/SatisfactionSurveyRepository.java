package com.pathfinder.repository;

import com.pathfinder.model.entity.SatisfactionSurvey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SatisfactionSurveyRepository extends JpaRepository<SatisfactionSurvey, Integer> {
    Optional<SatisfactionSurvey> findFirstByTargetTypeAndStatus(String targetType, String status);
    Optional<SatisfactionSurvey> findFirstByTargetTypeAndTargetIdAndStatus(String targetType, Integer targetId, String status);
}
