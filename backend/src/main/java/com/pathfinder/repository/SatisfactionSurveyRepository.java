package com.pathfinder.repository;

import com.pathfinder.model.entity.SatisfactionSurvey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SatisfactionSurveyRepository extends JpaRepository<SatisfactionSurvey, Integer> {
    Optional<SatisfactionSurvey> findFirstByStatus(String status);
}
