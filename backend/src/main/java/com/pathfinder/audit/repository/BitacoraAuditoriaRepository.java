package com.pathfinder.audit.repository;

import com.pathfinder.audit.model.BitacoraAuditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio JPA para realizar operaciones de persistencia sobre BitacoraAuditoria.
 */
@Repository
public interface BitacoraAuditoriaRepository extends JpaRepository<BitacoraAuditoria, Long> {
}
