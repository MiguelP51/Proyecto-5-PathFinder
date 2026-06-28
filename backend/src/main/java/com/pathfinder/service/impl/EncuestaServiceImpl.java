package com.pathfinder.service.impl;

import com.pathfinder.dto.request.SubmitEncuestaRequestDTO;
import com.pathfinder.dto.response.PreguntaResponseDTO;
import com.pathfinder.dto.response.EncuestaMentorFeedbackDTO;
import com.pathfinder.model.entity.PreguntaEncuesta;
import com.pathfinder.model.entity.RespuestaEncuesta;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.entity.Entrevista;
import com.pathfinder.repository.PreguntaEncuestaRepository;
import com.pathfinder.repository.RespuestaEncuestaRepository;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.repository.EntrevistaRepository;
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
    private final EntrevistaRepository entrevistaRepository;

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
    public boolean tieneEncuestaCompletada(String correoEstudiante, Integer idEntrevista) {
        if (idEntrevista != null) {
            return respuestaEncuestaRepository.existsByEntrevista_IdEntrevista(idEntrevista);
        }
        return tieneEncuestaCompletada(correoEstudiante);
    }

    @Override
    @Transactional
    public void guardarEncuesta(String correoEstudiante, SubmitEncuestaRequestDTO request) {
        String correoClean = correoEstudiante.trim().toLowerCase();
        Usuario estudiante = usuarioRepository.findByCorreo(correoClean)
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado"));

        final Integer finalIdEntrevista = (request.getIdEntrevista() != null) ? request.getIdEntrevista() :
            entrevistaRepository.findFirstByEstudiante_CorreoAndActivoTrueOrderByFechaDescHoraDesc(correoClean)
                    .map(Entrevista::getIdEntrevista)
                    .orElse(null);

        if (tieneEncuestaCompletada(correoClean, finalIdEntrevista)) {
            throw new IllegalStateException("Ya has respondido esta encuesta de satisfacción para la simulación correspondiente.");
        }

        if (request == null || request.getRespuestas() == null || request.getRespuestas().isEmpty()) {
            throw new IllegalArgumentException("La solicitud de encuesta no puede estar vacía.");
        }

        Entrevista entrevista = null;
        if (finalIdEntrevista != null) {
            entrevista = entrevistaRepository.findById(finalIdEntrevista)
                    .orElseThrow(() -> new IllegalArgumentException("Entrevista no encontrada: " + finalIdEntrevista));
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
            respuesta.setEntrevista(entrevista);
            respuesta.setValorEntero(item.getValorEntero());
            respuesta.setValorTexto(item.getValorTexto());
            respuesta.setFechaCompletada(LocalDateTime.now());
            respuesta.setActivo(true);

            respuestaEncuestaRepository.save(respuesta);
        }

        log.info("Encuesta guardada con éxito para el estudiante {}", correoClean);
    }

    @Override
    public List<EncuestaMentorFeedbackDTO> obtenerFeedbackMentor(String correoMentor) {
        Usuario mentor = usuarioRepository.findByCorreo(correoMentor.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Mentor no encontrado"));

        List<RespuestaEncuesta> respuestas = respuestaEncuestaRepository.findByEntrevista_Mentor_IdUsuario(mentor.getIdUsuario());

        // Group responses by Entrevista
        Map<Entrevista, List<RespuestaEncuesta>> respuestasPorEntrevista = respuestas.stream()
                .filter(r -> r.getEntrevista() != null)
                .collect(Collectors.groupingBy(RespuestaEncuesta::getEntrevista));

        return respuestasPorEntrevista.entrySet().stream()
                .map(entry -> {
                    Entrevista entrevista = entry.getKey();
                    List<RespuestaEncuesta> respuestasEntrevista = entry.getValue();

                    List<EncuestaMentorFeedbackDTO.RespuestaItem> items = respuestasEntrevista.stream()
                            .map(r -> EncuestaMentorFeedbackDTO.RespuestaItem.builder()
                                    .textoPregunta(r.getPregunta().getTextoPregunta())
                                    .tipoPregunta(r.getPregunta().getTipoPregunta())
                                    .valorEntero(r.getValorEntero())
                                    .valorTexto(r.getValorTexto())
                                    .build())
                            .collect(Collectors.toList());

                    return EncuestaMentorFeedbackDTO.builder()
                            .idEntrevista(entrevista.getIdEntrevista())
                            .fecha(entrevista.getFecha().toString())
                            .puestoInteres(entrevista.getPuesto())
                            .respuestas(items)
                            .build();
                })
                .sorted((a, b) -> b.getFecha().compareTo(a.getFecha())) // Sort newest first
                .collect(Collectors.toList());
    }
}
