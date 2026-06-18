package com.pathfinder.repository;

import com.pathfinder.model.entity.UsuarioPathChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioPathChallengeRepository extends JpaRepository<UsuarioPathChallenge, Integer> {

    Optional<UsuarioPathChallenge> findByUsuario_CorreoAndPathChallenge_IdPathChallenge(
            String correo,
            Integer idPathChallenge
    );

    List<UsuarioPathChallenge> findByUsuario_CorreoAndPathChallenge_IdPathChallengeIn(
            String correo,
            Collection<Integer> idsPathChallenge
    );

    Optional<UsuarioPathChallenge> findByUsuario_IdUsuarioAndPathChallenge_IdPathChallenge(
            Integer idUsuario,
            Integer idPathChallenge
    );
}