package com.pathfinder.repository;

import com.pathfinder.model.entity.MentorCertificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MentorCertificacionRepository extends JpaRepository<MentorCertificacion, Integer> {
    void deleteByMentorProfile_IdMentorProfile(Integer idMentorProfile);
}
