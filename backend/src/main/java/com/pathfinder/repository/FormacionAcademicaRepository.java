package com.pathfinder.repository;

import com.pathfinder.model.entity.FormacionAcademica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormacionAcademicaRepository extends JpaRepository<FormacionAcademica, Integer> {
    List<FormacionAcademica> findByPerfilCv_IdPerfilCv(Integer idPerfilCv);
    void deleteByPerfilCv_IdPerfilCv(Integer idPerfilCv);
}
