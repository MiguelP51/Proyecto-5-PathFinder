package com.pathfinder.service;

import com.pathfinder.dto.admin.curso.CursoExternoResponseDTO;
import com.pathfinder.dto.admin.skillpath.UpdateAdminSkillPathRequestDTO;
import com.pathfinder.model.entity.CursoExterno;
import com.pathfinder.model.entity.Habilidad;
import com.pathfinder.model.entity.ProveedorExterno;
import com.pathfinder.model.enums.NivelCurso;
import com.pathfinder.repository.CursoExternoRepository;
import com.pathfinder.repository.HabilidadRepository;
import com.pathfinder.repository.ProveedorExternoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminSkillPathService {

    private final CursoExternoRepository cursoExternoRepository;
    private final ProveedorExternoRepository proveedorExternoRepository;
    private final HabilidadRepository habilidadRepository;

    @Transactional(readOnly = true)
    public List<CursoExternoResponseDTO> buscarSkillPaths(
            String search,
            Integer idHabilidad,
            NivelCurso nivel
    ) {
        return cursoExternoRepository.buscarAdminSkillPaths(search, idHabilidad, nivel)
                .stream()
                .map(CursoExternoResponseDTO::from)
                .toList();
    }

    @Transactional
    public CursoExternoResponseDTO actualizarSkillPath(
            Integer idCurso,
            UpdateAdminSkillPathRequestDTO request
    ) {
        CursoExterno curso = cursoExternoRepository.findById(idCurso)
                .orElseThrow(() -> new EntityNotFoundException("Curso no encontrado con ID: " + idCurso));

        if (request.getIdProveedor() != null) {
            ProveedorExterno proveedor = proveedorExternoRepository.findById(request.getIdProveedor())
                    .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado con ID: " + request.getIdProveedor()));
            curso.setProveedor(proveedor);
        }

        if (request.getIdHabilidad() != null) {
            Habilidad habilidad = habilidadRepository.findById(request.getIdHabilidad())
                    .orElseThrow(() -> new EntityNotFoundException("Habilidad no encontrada con ID: " + request.getIdHabilidad()));
            curso.setHabilidad(habilidad);
        }

        curso.setTitulo(request.getTitulo());
        curso.setUrl(request.getUrl());
        curso.setDescripcion(request.getDescripcion());
        curso.setNivel(request.getNivel());
        curso.setDuracion(request.getDuracion());
        curso.setXp(request.getXp());
        curso.setEstadoEnlace(request.getEstadoEnlace());
        curso.setEsGratuito(request.getEsGratuito());

        if (request.getActivo() != null) {
            curso.setActivo(request.getActivo());
        }

        curso.setFechaModificacion(LocalDateTime.now());

        return CursoExternoResponseDTO.from(cursoExternoRepository.save(curso));
    }

    @Transactional
    public CursoExternoResponseDTO actualizarEstadoSkillPath(
            Integer idCurso,
            Boolean activo
    ) {
        CursoExterno curso = cursoExternoRepository.findById(idCurso)
                .orElseThrow(() -> new EntityNotFoundException("Curso no encontrado con ID: " + idCurso));

        curso.setActivo(activo);
        curso.setFechaModificacion(LocalDateTime.now());

        return CursoExternoResponseDTO.from(cursoExternoRepository.save(curso));
    }

    @Transactional
    public void eliminarSkillPath(Integer idCurso) {
        CursoExterno curso = cursoExternoRepository.findById(idCurso)
                .orElseThrow(() -> new EntityNotFoundException("Curso no encontrado con ID: " + idCurso));

        cursoExternoRepository.delete(curso);
    }
}