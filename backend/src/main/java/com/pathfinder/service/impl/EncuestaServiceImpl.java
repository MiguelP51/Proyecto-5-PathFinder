package com.pathfinder.service.impl;

import com.pathfinder.dto.request.SubmitEncuestaRequestDTO;
import com.pathfinder.dto.response.PreguntaResponseDTO;
import com.pathfinder.model.entity.PreguntaEncuesta;
import com.pathfinder.model.entity.RespuestaEncuesta;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.repository.PreguntaEncuestaRepository;
import com.pathfinder.repository.RespuestaEncuestaRepository;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.service.EncuestaService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EncuestaServiceImpl implements EncuestaService {

    private final PreguntaEncuestaRepository preguntaEncuestaRepository;
    private final RespuestaEncuestaRepository respuestaEncuestaRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    public List<PreguntaResponseDTO> obtenerPreguntasActivas() {
        List<PreguntaEncuesta> preguntas = preguntaEncuestaRepository.findByActivoTrueOrderByIdPreguntaAsc();
        return preguntas.stream()
                .map(p -> PreguntaResponseDTO.builder()
                        .idPregunta(p.getIdPregunta())
                        .textoPregunta(p.getTextoPregunta())
                        .tipoPregunta(p.getTipoPregunta())
                        .obligatoria(p.getObligatoria())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public boolean tieneEncuestaCompletada(String correoEstudiante) {
        return respuestaEncuestaRepository.existsByEstudiante_Correo(correoEstudiante.trim().toLowerCase());
    }

    @Override
    @Transactional
    public void guardarEncuesta(String correoEstudiante, SubmitEncuestaRequestDTO request) {
        String correoClean = correoEstudiante.trim().toLowerCase();
        Usuario estudiante = usuarioRepository.findByCorreo(correoClean)
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado"));

        if (tieneEncuestaCompletada(correoClean)) {
            throw new IllegalStateException("Ya has respondido esta encuesta de satisfacción.");
        }

        if (request == null || request.getRespuestas() == null || request.getRespuestas().isEmpty()) {
            throw new IllegalArgumentException("La solicitud de encuesta no puede estar vacía.");
        }

        List<PreguntaEncuesta> preguntasActivas = preguntaEncuestaRepository.findByActivoTrueOrderByIdPreguntaAsc();
        Map<Integer, PreguntaEncuesta> mapaPreguntas = preguntasActivas.stream()
                .collect(Collectors.toMap(PreguntaEncuesta::getIdPregunta, p -> p));

        // Map request answers for easier lookup
        Map<Integer, SubmitEncuestaRequestDTO.RespuestaItem> respuestasEnviadas = request.getRespuestas().stream()
                .collect(Collectors.toMap(SubmitEncuestaRequestDTO.RespuestaItem::getIdPregunta, r -> r));

        // Validate mandatory questions
        for (PreguntaEncuesta pregunta : preguntasActivas) {
            SubmitEncuestaRequestDTO.RespuestaItem respuesta = respuestasEnviadas.get(pregunta.getIdPregunta());

            if (Boolean.TRUE.equals(pregunta.getObligatoria())) {
                if (respuesta == null) {
                    throw new IllegalArgumentException("La pregunta obligatoria '" + pregunta.getTextoPregunta() + "' no ha sido respondida.");
                }

                if ("RATING".equalsIgnoreCase(pregunta.getTipoPregunta()) && respuesta.getValorEntero() == null) {
                    throw new IllegalArgumentException("La pregunta obligatoria '" + pregunta.getTextoPregunta() + "' requiere una puntuación.");
                }

                if ("TEXT".equalsIgnoreCase(pregunta.getTipoPregunta()) && !StringUtils.hasText(respuesta.getValorTexto())) {
                    throw new IllegalArgumentException("La pregunta obligatoria '" + pregunta.getTextoPregunta() + "' requiere una respuesta de texto.");
                }
            }
        }

        // Persist answers
        for (SubmitEncuestaRequestDTO.RespuestaItem item : request.getRespuestas()) {
            PreguntaEncuesta pregunta = mapaPreguntas.get(item.getIdPregunta());
            if (pregunta == null) {
                // Ignore answers to inactive or non-existent questions
                continue;
            }

            RespuestaEncuesta respuesta = new RespuestaEncuesta();
            respuesta.setEstudiante(estudiante);
            respuesta.setPregunta(pregunta);
            respuesta.setValorEntero(item.getValorEntero());
            respuesta.setValorTexto(item.getValorTexto());
            respuesta.setFechaCompletada(LocalDateTime.now());
            respuesta.setActivo(true);

            respuestaEncuestaRepository.save(respuesta);
        }

        log.info("Encuesta guardada con éxito para el estudiante {}", correoClean);
    }
}
