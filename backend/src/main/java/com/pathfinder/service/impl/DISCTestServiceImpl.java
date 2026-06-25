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

            // Acumular puntajes por categoria de la opcion elegida
            CategoriaDISC cat = (opcion != null && opcion.getCategoriaDisc() != null) ? opcion.getCategoriaDisc() : pregunta.getCategoriaDisc();
            if (cat != null) {
                switch (cat) {
                    case D -> puntajeD += 1;
                    case I -> puntajeI += 1;
                    case S -> puntajeS += 1;
                    case C -> puntajeC += 1;
                }
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
        if (d >= 12) return "D";
        if (i >= 12) return "I";
        if (s >= 12) return "S";
        if (c >= 12) return "C";

        // Combine the top factors
        List<Map.Entry<String, Integer>> factors = new ArrayList<>();
        factors.add(Map.entry("D", d));
        factors.add(Map.entry("I", i));
        factors.add(Map.entry("S", s));
        factors.add(Map.entry("C", c));

        factors.sort((a, b) -> b.getValue().compareTo(a.getValue()));

        int s0 = factors.get(0).getValue();
        int s1 = factors.get(1).getValue();
        int s2 = factors.get(2).getValue();
        int s3 = factors.get(3).getValue();

        if (s0 == s3) {
            return "Ninguno";
        }

        Set<String> selected = new HashSet<>();
        selected.add(factors.get(0).getKey());

        if (s0 > s1 && s1 == s2) {
            selected.add(factors.get(1).getKey());
            selected.add(factors.get(2).getKey());
        } else if (s0 == s1 && s1 == s2) {
            selected.add(factors.get(1).getKey());
            selected.add(factors.get(2).getKey());
        } else {
            selected.add(factors.get(1).getKey());
        }

        List<String> order = List.of("D", "I", "S", "C");
        return order.stream()
                .filter(selected::contains)
                .collect(Collectors.joining(" + "));
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
                nombrePerfil = "Emprendedor";
                descripcion = "Persona decidida, orientada a resultados concretos y motivada por los retos dificiles. Valora la eficiencia y la independencia.";
                fortalezas = List.of("Eficiencia", "Independencia", "Automotivacion", "Orientacion al logro");
                habilidades = List.of("Liderazgo Directivo", "Toma de Decisiones", "Resolucion de Conflictos");
                break;
            case "D + I":
                nombrePerfil = "Competidor";
                descripcion = "Perfil competitivo y entusiasta. Combina la determinacion por ganar con una alta capacidad de influencia y comunicacion asertiva.";
                fortalezas = List.of("Automotivacion", "Independencia", "Entusiasmo", "Iniciativa");
                habilidades = List.of("Negociacion Comercial", "Presentaciones Persuasivas", "Desarrollo de Negocios");
                break;
            case "D + S":
                nombrePerfil = "Realizador / Poco comun";
                descripcion = "Persona orientada a la ejecucion constante. Combina la firmeza del perfil dominante con la paciencia y perseverancia de la estabilidad.";
                fortalezas = List.of("Eficiencia", "Independencia", "Reflexividad", "Perseverancia");
                habilidades = List.of("Gestion de Proyectos", "Planificacion Operativa", "Resolucion de Problemas");
                break;
            case "D + C":
                nombrePerfil = "Creativo";
                descripcion = "Persona orientada a la innovacion y al detalle. Combina el impulso emprendedor con un enfoque riguroso y analitico.";
                fortalezas = List.of("Eficiencia", "Automotivacion", "Precision", "Sensibilidad");
                habilidades = List.of("Diseno de Procesos", "Analisis Estrategico", "Pensamiento Innovador");
                break;
            case "D + I + S":
                nombrePerfil = "Perfil valioso";
                descripcion = "Perfil versatil que combina iniciativa, sociabilidad y empatia. Se adapta bien a entornos cambiantes brindando soporte.";
                fortalezas = List.of("Independencia", "Autoconfianza", "Perseverancia", "Empatia");
                habilidades = List.of("Liderazgo de Equipos", "Gestion del Talento", "Orientacion al Cliente");
                break;
            case "D + I + C":
                nombrePerfil = "Dinamico";
                descripcion = "Persona energica y persuasiva. Combina un enfoque en resultados con gran carisma y atencion a los estandares de calidad.";
                fortalezas = List.of("Automotivacion", "Entusiasmo", "Sensibilidad", "Adaptabilidad");
                habilidades = List.of("Direccion Estrategica", "Oratoria y Comunicacion", "Gestion de la Calidad");
                break;
            case "D + S + C":
                nombrePerfil = "Analista competitivo";
                descripcion = "Perfil altamente analitico y metodico. Combina el rigor tecnico con una solida orientacion a la eficiencia y el control.";
                fortalezas = List.of("Eficiencia", "Reflexividad", "Precision", "Rigor Tecnico");
                habilidades = List.of("Analisis de Datos", "Optimizacion de Procesos", "Gestion de Riesgos");
                break;
            case "I":
                nombrePerfil = "Promotor";
                descripcion = "Persona optimista, comunicativa y sociable. Excelente para conectar personas, inspirar entusiasmo y fomentar la colaboracion.";
                fortalezas = List.of("Amigable", "Entusiasmo", "Autoconfianza", "Red de Contactos");
                habilidades = List.of("Relaciones Publicas", "Comunicacion Efectiva", "Motivacion de Equipos");
                break;
            case "I + S":
                nombrePerfil = "Consejero";
                descripcion = "Persona empatica, orientada a las personas y al servicio. Crea ambientes armonicos y es un excelente apoyo para sus companeros.";
                fortalezas = List.of("Amigable", "Autoconfianza", "Paciencia", "Perseverancia");
                habilidades = List.of("Mediacion de Conflictos", "Escucha Activa", "Gestion del Clima Laboral");
                break;
            case "I + C":
                nombrePerfil = "Evaluador";
                descripcion = "Persona analitica pero sociable. Evaluat situaciones con objetividad cientifica e influye en otros de manera empatica.";
                fortalezas = List.of("Amigable", "Entusiasmo", "Cooperatividad", "Sensibilidad");
                habilidades = List.of("Evaluacion de Desempeno", "Auditoria de Procesos", "Comunicacion Corporativa");
                break;
            case "I + S + C":
                nombrePerfil = "Experto / Profesional";
                descripcion = "Persona orientada al servicio, de trato amable y rigurosa en sus tareas. Combina empatia con un alto nivel de cumplimiento.";
                fortalezas = List.of("Amigable", "Paciencia", "Cooperatividad", "Orientacion al Detalle");
                habilidades = List.of("Atencion al Cliente", "Soporte Tecnico", "Administracion de Personal");
                break;
            case "S":
                nombrePerfil = "Planificador";
                descripcion = "Persona calmada, paciente y de gran constancia. Valora la estabilidad, el trabajo en equipo y los procesos predecibles.";
                fortalezas = List.of("Paciencia", "Reflexividad", "Perseverancia", "Lealtad");
                habilidades = List.of("Planificacion a Mediano Plazo", "Trabajo Colaborativo", "Gestion Documental");
                break;
            case "S + C":
                nombrePerfil = "Perfeccionista";
                descripcion = "Persona metodica, detallista y confiable. Busca hacer las cosas correctamente siguiendo estandares y guias claras.";
                fortalezas = List.of("Paciencia", "Reflexividad", "Cooperatividad", "Precision");
                habilidades = List.of("Control de Calidad", "Cumplimiento Regulatorio", "Soporte Operativo");
                break;
            case "C":
                nombrePerfil = "Pensador / Analista";
                descripcion = "Persona analitica, rigurosa y orientada a la precision tecnica. Valora el pensamiento critico, las reglas claras y la objetividad.";
                fortalezas = List.of("Cooperatividad", "Precision", "Sensibilidad", "Logica");
                habilidades = List.of("Pensamiento Critico", "Analisis Tecnico", "Gestion de Datos");
                break;
            case "Ninguno":
            default:
                nombrePerfil = "Perfil abrumado";
                descripcion = "Perfil no interpretable debido al bajo nivel de respuesta o dispersion de resultados. Se sugiere repetir el test con mayor concentracion.";
                fortalezas = List.of("No disponible");
                habilidades = List.of("Reevaluacion sugerida");
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
                .categoriaDisc(opcion.getCategoriaDisc() != null ? opcion.getCategoriaDisc().name() : null)
                .build();
    }
}
