package com.pathfinder.service;

import com.pathfinder.dto.admin.curso.CsvImportResultDTO;
import com.pathfinder.dto.admin.curso.UpdateCursoRequestDTO;
import com.pathfinder.model.entity.CursoExterno;
import com.pathfinder.model.entity.ProveedorExterno;
import com.pathfinder.repository.CursoExternoRepository;
import com.pathfinder.repository.ProveedorExternoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import com.pathfinder.dto.admin.curso.CreateProveedorRequestDTO;
import com.pathfinder.model.enums.EstadoConexion;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SincronizacionService {

    private final ProveedorExternoRepository proveedorRepository;
    private final CursoExternoRepository cursoRepository;

    @Transactional
    public ProveedorExterno crearProveedor(CreateProveedorRequestDTO request) {
        ProveedorExterno proveedor = new ProveedorExterno();
        proveedor.setNombre(request.getNombre());
        proveedor.setSoportaApi(request.getSoportaApi());
        proveedor.setCredenciales(request.getCredenciales());
        proveedor.setEstadoConexion(EstadoConexion.INACTIVO);
        return proveedorRepository.save(proveedor);
    }

    @Transactional(readOnly = true)
    public List<ProveedorExterno> listarProveedores() {
        return proveedorRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<CursoExterno> listarCursos(Integer idProveedor) {
        return cursoRepository.findAll().stream()
                .filter(c -> c.getProveedor().getIdProveedor().equals(idProveedor))
                .toList();
    }

    @Transactional
    public CursoExterno actualizarCurso(Integer idCurso, UpdateCursoRequestDTO request) {
        CursoExterno curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new EntityNotFoundException("Curso no encontrado con ID: " + idCurso));

        curso.setTitulo(request.getTitulo());
        curso.setUrl(request.getUrl());
        curso.setDescripcion(request.getDescripcion());
        curso.setNivel(request.getNivel());
        curso.setDuracion(request.getDuracion());
        curso.setXp(request.getXp());
        curso.setEstadoEnlace(request.getEstadoEnlace());
        curso.setEsGratuito(request.getEsGratuito());
        // ultima_verificacion no se actualiza manualmente

        return cursoRepository.save(curso);
    }

    @Transactional
    public void sincronizarApi(Integer idProveedor) {
        ProveedorExterno proveedor = proveedorRepository.findById(idProveedor)
                .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado"));
                
        if (!proveedor.getSoportaApi()) {
            throw new IllegalStateException("El proveedor no soporta sincronización automática por API");
        }
        
        // Aquí iría la lógica de llamada a UdemyApiClient o CourseraApiClient
        // Para Udemy, se filtraría internamente para excluir cursos de paga.
        // Simulamos éxito de la tarea.
        proveedor.setEstadoConexion(EstadoConexion.CONECTADO);
        proveedor.setUltimaSincronizacion(LocalDateTime.now());
        proveedorRepository.save(proveedor);
    }

    @Transactional
    public CsvImportResultDTO importarCsv(Integer idProveedor, MultipartFile file) {
        ProveedorExterno proveedor = proveedorRepository.findById(idProveedor)
                .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado"));
                
        // Lógica de parseo CSV iría aquí
        return CsvImportResultDTO.builder()
                .mensaje("Importación simulada exitosa")
                .totalProcesados(0)
                .cursosInsertados(0)
                .errores(0)
                .build();
    }

    @Transactional(readOnly = true)
    public long contarCursosPorProveedor(Integer idProveedor) {
        return cursoRepository.countByProveedorIdProveedor(idProveedor);
    }
}
