package com.pathfinder.service.impl;

import com.pathfinder.dto.admin.disc.PreguntaDISCResponseDTO;
import com.pathfinder.dto.admin.disc.OpcionPreguntaDISCResponseDTO;
import com.pathfinder.dto.request.RespuestaDISCRequestDTO;
import com.pathfinder.dto.response.ResultadoDISCResponseDTO;
import com.pathfinder.model.entity.*;
import com.pathfinder.model.enums.*;
import com.pathfinder.repository.*;
import com.pathfinder.service.DISCTestService;
import com.pathfinder.service.PerfilEstudianteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DISCTestServiceImpl implements DISCTestService {

    private final UsuarioRepository usuarioRepository;
    private final PreguntaDISCRepository preguntaDISCRepository;
    private final OpcionPreguntaDISCRepository opcionPreguntaDISCRepository;
    private final RespuestaPreguntaDISCRepository respuestaPreguntaDISCRepository;
    private final ResultadoDISCRepository resultadoDISCRepository;
    private final ProgresoEstudianteRepository progresoRepo;
    private final PerfilEstudianteService perfilEstudianteService;

    @Override
    public List<PreguntaDISCResponseDTO> obtenerPreguntas(String correo) {
        Usuario usuario = obtenerUsuario(correo);
        validarAccesoTest(usuario);

        List<PreguntaDISC> preguntas = preguntaDISCRepository.findByActivoTrueOrderByOrdenPreguntaAsc();
        return preguntas.stream()
                .map(this::toPreguntaResponse)
                .toList();
    }

    @Override
    @Transactional
    public ResultadoDISCResponseDTO guardarRespuestas(String correo, List<RespuestaDISCRequestDTO> respuestas) {
        Usuario usuario = obtenerUsuario(correo);
        validarAccesoTest(usuario);

        if (respuestas == null || respuestas.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Las respuestas no pueden estar vacías");
        }

        // 1. Eliminar respuestas previas para evitar duplicados si repite el test
        List<RespuestaPreguntaDISC> respuestasPrevias = respuestaPreguntaDISCRepository.findByUsuario_IdUsuario(usuario.getIdUsuario());
        if (!respuestasPrevias.isEmpty()) {
            respuestaPreguntaDISCRepository.deleteAll(respuestasPrevias);
        }

        int puntajeD = 0;
        int puntajeI = 0;
        int puntajeS = 0;
        int puntajeC = 0;

        // 2. Procesar y guardar cada respuesta
        for (RespuestaDISCRequestDTO respDto : respuestas) {
            if (respDto.getIdPreguntaDisc() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El ID de pregunta es obligatorio");
            }

            PreguntaDISC pregunta = preguntaDISCRepository.findById(respDto.getIdPreguntaDisc())
                    .filter(p -> Boolean.TRUE.equals(p.getActivo()))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pregunta DISC no encontrada o inactiva"));

            OpcionPreguntaDISC opcion = null;
            int valor = 0;

            if (pregunta.getTipoPreguntaDisc().getCodigo().equals("SELECCION") || pregunta.getTipoPreguntaDisc().getCodigo().equals("IMAGEN")) {
                if (respDto.getIdOpcionPreguntaDisc() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La opción de respuesta es obligatoria para esta pregunta");
                }
                opcion = opcionPreguntaDISCRepository.findById(respDto.getIdOpcionPreguntaDisc())
                        .filter(o -> Boolean.TRUE.equals(o.getActivo()))
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opción DISC no encontrada o inactiva"));

                if (!opcion.getPreguntaDisc().getIdPreguntaDisc().equals(pregunta.getIdPreguntaDisc())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La opción seleccionada no pertenece a la pregunta");
                }
                valor = opcion.getValorRespuesta() != null ? opcion.getValorRespuesta() : 0;
            } else {
                // Para TEXTO_LIBRE u otros tipos de pregunta abierta
                valor = 0;
            }

            RespuestaPreguntaDISC respuesta = new RespuestaPreguntaDISC();
            respuesta.setUsuario(usuario);
            respuesta.setPreguntaDisc(pregunta);
            respuesta.setOpcionPreguntaDisc(opcion);
            respuesta.setValorRespuesta(valor);
            respuesta.setRespuestaTexto(respDto.getRespuestaTexto());
            respuesta.setActivo(true);
            respuesta.setFechaRegistro(LocalDateTime.now());
            respuestaPreguntaDISCRepository.save(respuesta);

            // Acumular puntajes
            switch (pregunta.getCategoriaDisc()) {
                case D -> puntajeD += valor;
                case I -> puntajeI += valor;
                case S -> puntajeS += valor;
                case C -> puntajeC += valor;
            }
        }

        // 3. Determinar el perfil dominante
        String perfilDominante = calcularPerfilDominante(puntajeD, puntajeI, puntajeS, puntajeC);

        // 4. Guardar el resultado consolidado
        ResultadoDISC resultado = new ResultadoDISC();
        resultado.setUsuario(usuario);
        resultado.setPuntajeD(puntajeD);
        resultado.setPuntajeI(puntajeI);
        resultado.setPuntajeS(puntajeS);
        resultado.setPuntajeC(puntajeC);
        resultado.setPerfilDominante(perfilDominante);
        resultado.setFechaFinalizacion(LocalDateTime.now());
        resultado.setActivo(true);
        resultado.setFechaRegistro(LocalDateTime.now());
        resultado = resultadoDISCRepository.save(resultado);

        // 5. Actualizar el progreso del estudiante a COMPLETADA
        perfilEstudianteService.actualizarProgresoEstudiante(
                correo, NombreEtapa.TEST_DISC, EstadoEtapa.COMPLETADA, true
        );

        return buildResultadoResponse(resultado);
    }

    @Override
    public ResultadoDISCResponseDTO obtenerResultado(String correo) {
        Usuario usuario = obtenerUsuario(correo);
        ResultadoDISC resultado = resultadoDISCRepository.findFirstByUsuario_IdUsuarioOrderByFechaFinalizacionDesc(usuario.getIdUsuario())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontraron resultados del test DISC para este usuario"));

        return buildResultadoResponse(resultado);
    }

    @Override
    public ResultadoDISCResponseDTO obtenerResultadoPorUsuarioId(Integer idUsuario) {
        ResultadoDISC resultado = resultadoDISCRepository.findFirstByUsuario_IdUsuarioOrderByFechaFinalizacionDesc(idUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontraron resultados del test DISC para este usuario"));

        return buildResultadoResponse(resultado);
    }

    private Usuario obtenerUsuario(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado: " + correo));
    }

    private void validarAccesoTest(Usuario usuario) {
        // HU-EST-10: Debe haber completado la etapa CONFIRMACION_PERFIL
        EstadoEtapa estadoConfirmacion = progresoRepo.findByUsuario_IdUsuarioAndNombreEtapa(usuario.getIdUsuario(), NombreEtapa.CONFIRMACION_PERFIL)
                .map(ProgresoEstudiante::getEstadoEtapa)
                .orElse(EstadoEtapa.PENDIENTE);

        if (estadoConfirmacion != EstadoEtapa.COMPLETADA) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Debe confirmar su perfil profesional antes de acceder al test DISC");
        }

        // Si ya accedió, marcar la etapa en progreso
        perfilEstudianteService.actualizarProgresoEstudiante(
                usuario.getCorreo(), NombreEtapa.TEST_DISC, EstadoEtapa.EN_PROGRESO, false
        );
    }

    private String calcularPerfilDominante(int d, int i, int s, int c) {
        Map<String, Integer> puntajes = new HashMap<>();
        puntajes.put("D", d);
        puntajes.put("I", i);
        puntajes.put("S", s);
        puntajes.put("C", c);

        return puntajes.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("D");
    }

    private ResultadoDISCResponseDTO buildResultadoResponse(ResultadoDISC resultado) {
        int sum = resultado.getPuntajeD() + resultado.getPuntajeI() + resultado.getPuntajeS() + resultado.getPuntajeC();
        int pctD = sum > 0 ? (resultado.getPuntajeD() * 100) / sum : 0;
        int pctI = sum > 0 ? (resultado.getPuntajeI() * 100) / sum : 0;
        int pctS = sum > 0 ? (resultado.getPuntajeS() * 100) / sum : 0;
        int pctC = sum > 0 ? (resultado.getPuntajeC() * 100) / sum : 0;

        String perfil = resultado.getPerfilDominante();
        String nombrePerfil = "";
        String descripcion = "";
        List<String> fortalezas = List.of();
        List<String> habilidades = List.of();

        switch (perfil) {
            case "D":
                nombrePerfil = "Dominancia";
                descripcion = "Eres una persona orientada a resultados, decidida y directa. Te motivan los retos difíciles y tienes una alta capacidad de liderazgo y resolución de problemas bajo presión.";
                fortalezas = List.of("Toma de decisiones rápidas", "Orientación al logro y metas", "Asertividad y honestidad", "Resolución práctica de problemas");
                habilidades = List.of("Liderazgo de Equipos", "Gestión de Proyectos", "Toma de Decisiones Estratégicas", "Negociación Avanzada");
                break;
            case "I":
                nombrePerfil = "Influencia";
                descripcion = "Eres una persona entusiasta, comunicativa y optimista. Te enfocas en las relaciones interpersonales, disfrutas colaborar y posees una gran capacidad para persuadir y motivar a otros.";
                fortalezas = List.of("Comunicación persuasiva", "Facilidad para hacer networking", "Entusiasmo contagioso", "Creatividad y pensamiento innovador");
                habilidades = List.of("Comunicación Efectiva", "Oratoria y Presentación", "Trabajo en Equipo", "Ventas y Relaciones Públicas");
                break;
            case "S":
                nombrePerfil = "Estabilidad";
                descripcion = "Eres una persona colaborativa, paciente, confiable y leal. Valoras la armonía dentro del equipo, trabajas de manera constante y eres un excelente oyente que brinda soporte a los demás.";
                fortalezas = List.of("Escucha activa y empatía", "Trabajo constante y fiable", "Mediación y resolución de conflictos", "Lealtad y soporte al grupo");
                habilidades = List.of("Resolución de Conflictos", "Empatía y Escucha Activa", "Gestión del Cambio", "Colaboración Multidisciplinaria");
                break;
            case "C":
                nombrePerfil = "Cumplimiento";
                descripcion = "Eres una persona analítica, precisa y orientada al detalle. Te aseguras de que el trabajo cumpla con altos estándares de calidad siguiendo reglas, procesos y basándote en datos objetivos.";
                fortalezas = List.of("Análisis exhaustivo de datos", "Precisión y control de calidad", "Apego riguroso a procesos y normas", "Pensamiento lógico y sistemático");
                habilidades = List.of("Análisis de Datos", "Pensamiento Crítico y Resolución de Problemas", "Gestión de la Calidad", "Organización y Planificación");
                break;
        }

        return ResultadoDISCResponseDTO.builder()
                .idResultadoDisc(resultado.getIdResultadoDisc())
                .idUsuario(resultado.getUsuario().getIdUsuario())
                .puntajeD(resultado.getPuntajeD())
                .puntajeI(resultado.getPuntajeI())
                .puntajeS(resultado.getPuntajeS())
                .puntajeC(resultado.getPuntajeC())
                .porcentajeD(pctD)
                .porcentajeI(pctI)
                .porcentajeS(pctS)
                .porcentajeC(pctC)
                .perfilDominante(perfil)
                .nombrePerfil(nombrePerfil)
                .descripcion(descripcion)
                .fortalezas(fortalezas)
                .habilidadesSugeridas(habilidades)
                .fechaFinalizacion(resultado.getFechaFinalizacion())
                .build();
    }

    private PreguntaDISCResponseDTO toPreguntaResponse(PreguntaDISC pregunta) {
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
}
