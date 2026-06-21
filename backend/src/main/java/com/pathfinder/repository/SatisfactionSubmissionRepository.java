package com.pathfinder.repository;

import com.pathfinder.model.entity.SatisfactionSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SatisfactionSubmissionRepository extends JpaRepository<SatisfactionSubmission, Integer> {
    boolean existsBySurvey_IdSurveyAndStudent_IdUsuario(Integer idSurvey, Integer idUsuario);
}
