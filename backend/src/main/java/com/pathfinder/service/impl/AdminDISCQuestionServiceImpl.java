package com.pathfinder.service.impl;

import com.pathfinder.dto.admin.disc.OpcionPreguntaDISCRequestDTO;
import com.pathfinder.dto.admin.disc.OpcionPreguntaDISCResponseDTO;
import com.pathfinder.dto.admin.disc.PreguntaDISCRequestDTO;
import com.pathfinder.dto.admin.disc.PreguntaDISCResponseDTO;
import com.pathfinder.model.entity.OpcionPreguntaDISC;
import com.pathfinder.model.entity.PreguntaDISC;
import com.pathfinder.model.entity.TipoPreguntaDISC;
import com.pathfinder.model.enums.CategoriaDISC;
import com.pathfinder.repository.PreguntaDISCRepository;
import com.pathfinder.repository.TipoPreguntaDISCRepository;
import com.pathfinder.service.AdminDISCQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDISCQuestionServiceImpl implements AdminDISCQuestionService {

    private final PreguntaDISCRepository preguntaDISCRepository;
    private final TipoPreguntaDISCRepository tipoPreguntaDISCRepository;

    @Override
    public List<PreguntaDISCResponseDTO> listarPreguntas(CategoriaDISC categoriaDisc) {
        List<PreguntaDISC> preguntas = categoriaDisc == null
                ? preguntaDISCRepository.findByActivoTrueOrderByOrdenPreguntaAsc()
                : preguntaDISCRepository.findByCategoriaDiscAndActivoTrueOrderByOrdenPreguntaAsc(categoriaDisc);

        return preguntas.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public PreguntaDISCResponseDTO obtenerPregunta(Integer idPreguntaDisc) {
        PreguntaDISC pregunta = buscarPregunta(idPreguntaDisc);
        return toResponse(pregunta);
    }

    @Override
    public PreguntaDISCResponseDTO crearPregunta(PreguntaDISCRequestDTO request) {
        validarPregunta(request);

        TipoPreguntaDISC tipoPregunta = buscarTipoPregunta(request.getIdTipoPreguntaDisc());

        PreguntaDISC pregunta = new PreguntaDISC();
        pregunta.setEnunciado(request.getEnunciado().trim());
        pregunta.setCategoriaDisc(request.getCategoriaDisc());
        pregunta.setTipoPreguntaDisc(tipoPregunta);
        pregunta.setOrdenPregunta(request.getOrdenPregunta());
        pregunta.setImagenUrl(request.getImagenUrl());
        pregunta.setObligatoria(request.getObligatoria() != null ? request.getObligatoria() : true);
        pregunta.setActivo(true);

        agregarOpciones(pregunta, request.getOpciones());

        PreguntaDISC guardada = preguntaDISCRepository.save(pregunta);
        return toResponse(guardada);
    }

    @Override
    public PreguntaDISCResponseDTO actualizarPregunta(Integer idPreguntaDisc, PreguntaDISCRequestDTO request) {
        validarPregunta(request);

        PreguntaDISC pregunta = buscarPregunta(idPreguntaDisc);
        TipoPreguntaDISC tipoPregunta = buscarTipoPregunta(request.getIdTipoPreguntaDisc());

        pregunta.setEnunciado(request.getEnunciado().trim());
        pregunta.setCategoriaDisc(request.getCategoriaDisc());
        pregunta.setTipoPreguntaDisc(tipoPregunta);
        pregunta.setOrdenPregunta(request.getOrdenPregunta());
        pregunta.setImagenUrl(request.getImagenUrl());
        pregunta.setObligatoria(request.getObligatoria() != null ? request.getObligatoria() : true);

        pregunta.getOpciones().clear();
        agregarOpciones(pregunta, request.getOpciones());

        PreguntaDISC actualizada = preguntaDISCRepository.save(pregunta);
        return toResponse(actualizada);
    }

    @Override
    public void eliminarPregunta(Integer idPreguntaDisc) {
        PreguntaDISC pregunta = buscarPregunta(idPreguntaDisc);
        pregunta.setActivo(false);

        if (pregunta.getOpciones() != null) {
            pregunta.getOpciones().forEach(opcion -> opcion.setActivo(false));
        }

        preguntaDISCRepository.save(pregunta);
    }

    private PreguntaDISC buscarPregunta(Integer idPreguntaDisc) {
        return preguntaDISCRepository.findById(idPreguntaDisc)
                .filter(pregunta -> Boolean.TRUE.equals(pregunta.getActivo()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró la pregunta DISC solicitada"
                ));
    }

    private TipoPreguntaDISC buscarTipoPregunta(Integer idTipoPreguntaDisc) {
        return tipoPreguntaDISCRepository.findById(idTipoPreguntaDisc)
                .filter(tipo -> Boolean.TRUE.equals(tipo.getActivo()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró el tipo de pregunta DISC solicitado"
                ));
    }

    private void validarPregunta(PreguntaDISCRequestDTO request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La pregunta es obligatoria");
        }

        if (request.getEnunciado() == null || request.getEnunciado().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El enunciado de la pregunta es obligatorio");
        }

        if (request.getCategoriaDisc() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La dimensión DISC es obligatoria");
        }

        if (request.getIdTipoPreguntaDisc() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El tipo de pregunta es obligatorio");
        }

        if (request.getOpciones() == null || request.getOpciones().size() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La pregunta debe tener al menos 2 opciones");
        }

        for (OpcionPreguntaDISCRequestDTO opcion : request.getOpciones()) {
            if (opcion.getTextoOpcion() == null || opcion.getTextoOpcion().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todas las opciones deben tener texto");
            }

            if (opcion.getOrdenOpcion() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todas las opciones deben tener orden");
            }
        }
    }

    private void agregarOpciones(PreguntaDISC pregunta, List<OpcionPreguntaDISCRequestDTO> opcionesRequest) {
        if (opcionesRequest == null) {
            return;
        }

        opcionesRequest.forEach(opcionRequest -> {
            OpcionPreguntaDISC opcion = new OpcionPreguntaDISC();
            opcion.setPreguntaDisc(pregunta);
            opcion.setTextoOpcion(opcionRequest.getTextoOpcion().trim());
            opcion.setValorRespuesta(opcionRequest.getValorRespuesta());
            opcion.setImagenUrl(opcionRequest.getImagenUrl());
            opcion.setOrdenOpcion(opcionRequest.getOrdenOpcion());
            opcion.setActivo(true);

            pregunta.getOpciones().add(opcion);
        });
    }

    private PreguntaDISCResponseDTO toResponse(PreguntaDISC pregunta) {
        List<OpcionPreguntaDISCResponseDTO> opciones = pregunta.getOpciones() == null
                ? List.of()
                : pregunta.getOpciones().stream()
                .filter(opcion -> Boolean.TRUE.equals(opcion.getActivo()))
                .sorted(Comparator.comparing(OpcionPreguntaDISC::getOrdenOpcion, Comparator.nullsLast(Integer::compareTo)))
                .map(this::toOpcionResponse)
                .toList();

        TipoPreguntaDISC tipo = pregunta.getTipoPreguntaDisc();

        return PreguntaDISCResponseDTO.builder()
                .idPreguntaDisc(pregunta.getIdPreguntaDisc())
                .enunciado(pregunta.getEnunciado())
                .categoriaDisc(pregunta.getCategoriaDisc())
                .ordenPregunta(pregunta.getOrdenPregunta())
                .imagenUrl(pregunta.getImagenUrl())
                .obligatoria(pregunta.getObligatoria())
                .activo(pregunta.getActivo())
                .idTipoPreguntaDisc(tipo != null ? tipo.getIdTipoPreguntaDisc() : null)
                .codigoTipoPregunta(tipo != null ? tipo.getCodigo() : null)
                .nombreTipoPregunta(tipo != null ? tipo.getNombre() : null)
                .cantidadOpciones(opciones.size())
                .opciones(opciones)
                .build();
    }

    private OpcionPreguntaDISCResponseDTO toOpcionResponse(OpcionPreguntaDISC opcion) {
        return OpcionPreguntaDISCResponseDTO.builder()
                .idOpcionPreguntaDisc(opcion.getIdOpcionPreguntaDisc())
                .textoOpcion(opcion.getTextoOpcion())
                .valorRespuesta(opcion.getValorRespuesta())
                .imagenUrl(opcion.getImagenUrl())
                .ordenOpcion(opcion.getOrdenOpcion())
                .activo(opcion.getActivo())
                .build();
    }

    @Override
    public List<TipoPreguntaDISC> listarTiposPregunta() {
        return tipoPreguntaDISCRepository.findByActivoTrue();
    }
}