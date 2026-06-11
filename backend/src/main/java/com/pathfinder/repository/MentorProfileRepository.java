package com.pathfinder.repository;

import com.pathfinder.model.entity.MentorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MentorProfileRepository extends JpaRepository<MentorProfile, Integer> {
    Optional<MentorProfile> findByMentor_IdUsuario(Integer idUsuario);
    Optional<MentorProfile> findByMentor_Correo(String correo);
    boolean existsByMentor_Correo(String correo);
}
