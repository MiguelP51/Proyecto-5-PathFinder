package com.pathfinder.repository;

import com.pathfinder.model.entity.SatisfactionAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SatisfactionAnswerRepository extends JpaRepository<SatisfactionAnswer, Integer> {
    List<SatisfactionAnswer> findBySubmission_IdSubmission(Integer submissionId);
}
