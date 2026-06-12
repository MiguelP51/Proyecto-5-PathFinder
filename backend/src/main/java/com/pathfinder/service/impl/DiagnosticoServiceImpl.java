package com.pathfinder.service.impl;

import com.pathfinder.dto.request.ResponderPreguntaRequest;
import com.pathfinder.dto.response.DiagnosticoIniciadoDTO;
import com.pathfinder.dto.response.DiagnosticoResultadoDTO;
import com.pathfinder.dto.response.PreguntaDiagnosticoDTO;
import com.pathfinder.model.entity.*;
import com.pathfinder.repository.*;
import com.pathfinder.service.DiagnosticoService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.pathfinder.dto.response.DiagnosticoEstadoDTO;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiagnosticoServiceImpl implements DiagnosticoService {

    private final PreguntaDiagnosticoRepository preguntaRepo;
    private final DiagnosticoInicialRepository diagnosticoRepo;
    private final RespuestaDiagnosticoRepository respuestaRepo;
    private final SubAreaRepository subAreaRepo;
    private final UsuarioRepository usuarioRepo;

    @Override
    @Transactional
    public DiagnosticoIniciadoDTO iniciarDiagnostico(Integer idSubarea, Integer idUsuario) {
        // Si ya hay uno en progreso, reutilizarlo
        DiagnosticoInicial diagnostico = diagnosticoRepo
            .findByUsuario_IdUsuarioAndSubArea_IdSubareaAndEstado(idUsuario, idSubarea, "EN_PROGRESO")
            .orElseGet(() -> {
                SubArea subArea = subAreaRepo.findById(idSubarea)
                    .orElseThrow(() -> new EntityNotFoundException("SubArea no encontrada"));
                Usuario usuario = usuarioRepo.findById(idUsuario)
                    .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                DiagnosticoInicial nuevo = new DiagnosticoInicial();
                nuevo.setSubArea(subArea);
                nuevo.setUsuario(usuario);
                nuevo.setEstado("EN_PROGRESO");
                nuevo.setFechaInicio(LocalDateTime.now());
                return diagnosticoRepo.save(nuevo);
            });

        List<PreguntaDiagnostico> preguntas = preguntaRepo
            .findBySubArea_IdSubareaAndActivoTrueOrderByOrdenAsc(idSubarea);

        List<PreguntaDiagnosticoDTO> preguntasDTO = preguntas.stream()
            .map(p -> PreguntaDiagnosticoDTO.builder()
                .idPreguntaDiagnostico(p.getIdPreguntaDiagnostico())
                .enunciado(p.getEnunciado())
                .opcionA(p.getOpcionA())
                .opcionB(p.getOpcionB())
                .opcionC(p.getOpcionC())
                .opcionD(p.getOpcionD())
                .orden(p.getOrden())
                .build())
            .toList();

        return DiagnosticoIniciadoDTO.builder()
            .idDiagnostico(diagnostico.getIdDiagnostico())
            .estado(diagnostico.getEstado())
            .preguntas(preguntasDTO)
            .build();
    }

    @Override
    @Transactional
    public void responderPregunta(Integer idDiagnostico, ResponderPreguntaRequest request, Integer idUsuario) {
        DiagnosticoInicial diagnostico = diagnosticoRepo.findById(idDiagnostico)
            .orElseThrow(() -> new EntityNotFoundException("Diagnóstico no encontrado"));

        if (!diagnostico.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new IllegalArgumentException("No autorizado");
        }

        PreguntaDiagnostico pregunta = preguntaRepo.findById(request.getIdPreguntaDiagnostico())
            .orElseThrow(() -> new EntityNotFoundException("Pregunta no encontrada"));

        boolean esCorrecta = pregunta.getRespuestaCorrecta()
            .equalsIgnoreCase(request.getRespuestaElegida());

        // Buscar si ya respondió esta pregunta y actualizar, o crear nueva
        List<RespuestaDiagnostico> existentes = respuestaRepo
            .findByDiagnostico_IdDiagnostico(idDiagnostico);

        RespuestaDiagnostico respuesta = existentes.stream()
            .filter(r -> r.getPregunta().getIdPreguntaDiagnostico()
                .equals(request.getIdPreguntaDiagnostico()))
            .findFirst()
            .orElseGet(() -> {
                RespuestaDiagnostico nueva = new RespuestaDiagnostico();
                nueva.setDiagnostico(diagnostico);
                nueva.setPregunta(pregunta);
                return nueva;
            });

        respuesta.setRespuestaElegida(request.getRespuestaElegida().toUpperCase());
        respuesta.setEsCorrecta(esCorrecta);
        respuestaRepo.save(respuesta);
    }

    @Override
    @Transactional
    public DiagnosticoResultadoDTO finalizarDiagnostico(Integer idDiagnostico, Integer idUsuario) {
        DiagnosticoInicial diagnostico = diagnosticoRepo.findById(idDiagnostico)
            .orElseThrow(() -> new EntityNotFoundException("Diagnóstico no encontrado"));

        if (!diagnostico.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new IllegalArgumentException("No autorizado");
        }

        List<RespuestaDiagnostico> respuestas = respuestaRepo
            .findByDiagnostico_IdDiagnostico(idDiagnostico);

        int totalPreguntas = preguntaRepo
            .findBySubArea_IdSubareaAndActivoTrueOrderByOrdenAsc(
                diagnostico.getSubArea().getIdSubarea()).size();

        int correctas = (int) respuestas.stream().filter(RespuestaDiagnostico::getEsCorrecta).count();
        int puntaje = totalPreguntas > 0 ? (correctas * 100) / totalPreguntas : 0;

        String nivel;
        if (puntaje >= 70) nivel = "Avanzado";
        else if (puntaje >= 40) nivel = "Intermedio";
        else nivel = "Principiante";

        diagnostico.setEstado("COMPLETADO");
        diagnostico.setPuntaje(puntaje);
        diagnostico.setTotalPreguntas(totalPreguntas);
        diagnostico.setRespuestasCorrectas(correctas);
        diagnostico.setNivelRecomendado(nivel);
        diagnostico.setFechaFin(LocalDateTime.now());
        diagnosticoRepo.save(diagnostico);

        return DiagnosticoResultadoDTO.builder()
            .idDiagnostico(diagnostico.getIdDiagnostico())
            .puntaje(puntaje)
            .totalPreguntas(totalPreguntas)
            .respuestasCorrectas(correctas)
            .nivelRecomendado(nivel)
            .estado("COMPLETADO")
            .build();
    }

    @Override
    public DiagnosticoResultadoDTO obtenerResultado(Integer idDiagnostico, Integer idUsuario) {
        DiagnosticoInicial diagnostico = diagnosticoRepo.findById(idDiagnostico)
            .orElseThrow(() -> new EntityNotFoundException("Diagnóstico no encontrado"));

        if (!diagnostico.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new IllegalArgumentException("No autorizado");
        }

        return DiagnosticoResultadoDTO.builder()
            .idDiagnostico(diagnostico.getIdDiagnostico())
            .puntaje(diagnostico.getPuntaje())
            .totalPreguntas(diagnostico.getTotalPreguntas())
            .respuestasCorrectas(diagnostico.getRespuestasCorrectas())
            .nivelRecomendado(diagnostico.getNivelRecomendado())
            .estado(diagnostico.getEstado())
            .build();
    }

    @Override
    public DiagnosticoEstadoDTO obtenerUltimoDiagnosticoSubarea(Integer idSubarea, Integer idUsuario) {
        return diagnosticoRepo
                .findTopByUsuario_IdUsuarioAndSubArea_IdSubareaOrderByFechaInicioDesc(idUsuario, idSubarea)
                .map(diagnostico -> DiagnosticoEstadoDTO.builder()
                        .idDiagnostico(diagnostico.getIdDiagnostico())
                        .estado(diagnostico.getEstado())
                        .puntaje(diagnostico.getPuntaje())
                        .totalPreguntas(diagnostico.getTotalPreguntas())
                        .respuestasCorrectas(diagnostico.getRespuestasCorrectas())
                        .nivelRecomendado(diagnostico.getNivelRecomendado())
                        .completado("COMPLETADO".equalsIgnoreCase(diagnostico.getEstado()))
                        .build()
                )
                .orElse(
                        DiagnosticoEstadoDTO.builder()
                                .completado(false)
                                .build()
                );
    }
}
