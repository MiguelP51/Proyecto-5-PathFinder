package com.pathfinder.repository;

import com.pathfinder.model.entity.ArchivoCV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArchivoCVRepository extends JpaRepository<ArchivoCV, Integer> {

    // Todos los archivos activos de un perfil (para el reemplazo — RF11)
    List<ArchivoCV> findByPerfilCv_IdPerfilCvAndActivoTrue(Integer idPerfilCv);

    // El archivo activo más reciente (para mostrar cuál está vigente)
    Optional<ArchivoCV> findTopByPerfilCv_IdPerfilCvAndActivoTrueOrderByFechaCargaDesc(
            Integer idPerfilCv);
}
