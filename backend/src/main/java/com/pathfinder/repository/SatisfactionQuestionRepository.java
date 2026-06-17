package com.pathfinder.repository;

import com.pathfinder.model.entity.SatisfactionQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SatisfactionQuestionRepository extends JpaRepository<SatisfactionQuestion, Integer> {
    List<SatisfactionQuestion> findBySurvey_IdSurveyOrderByOrderIndexAsc(Integer idSurvey);
}
