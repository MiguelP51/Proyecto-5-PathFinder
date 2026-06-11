package com.pathfinder.repository;

import com.pathfinder.model.entity.MentorAreaExpertise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MentorAreaExpertiseRepository extends JpaRepository<MentorAreaExpertise, Integer> {
    void deleteByMentorProfile_IdMentorProfile(Integer idMentorProfile);
    List<MentorAreaExpertise> findByMentorProfile_IdMentorProfile(Integer idMentorProfile);
}
