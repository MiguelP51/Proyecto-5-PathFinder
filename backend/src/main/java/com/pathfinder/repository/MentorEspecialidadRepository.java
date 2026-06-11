package com.pathfinder.repository;

import com.pathfinder.model.entity.MentorEspecialidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MentorEspecialidadRepository extends JpaRepository<MentorEspecialidad, Integer> {
    void deleteByMentorProfile_IdMentorProfile(Integer idMentorProfile);
}
