package com.pathfinder.config;

import com.pathfinder.model.entity.PreguntaEncuesta;
import com.pathfinder.repository.PreguntaEncuestaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class EncuestaDataInitializer implements CommandLineRunner {

    private final PreguntaEncuestaRepository preguntaEncuestaRepository;

    @Override
    public void run(String... args) {
        long count = preguntaEncuestaRepository.count();
        if (count < 6) {
            log.info("Sembrando o actualizando preguntas de la encuesta de satisfacción...");
            try {
                preguntaEncuestaRepository.deleteAll();
            } catch (Exception e) {
                log.warn("No se pudo limpiar la tabla de preguntas: {}", e.getMessage());
            }
            List<PreguntaEncuesta> preguntas = new ArrayList<>();

            preguntas.add(crearPregunta(
                    "¿Cómo calificarías tu experiencia general con la plataforma PathFinder?",
                    "RATING",
                    true
            ));

            preguntas.add(crearPregunta(
                    "¿Qué tan útil te resultó la evaluación psicométrica y test DISC?",
                    "RATING",
                    true
            ));

            preguntas.add(crearPregunta(
                    "¿Qué tan útil te resultó la simulación de entrevista con tu PathMentor?",
                    "RATING",
                    true
            ));

            preguntas.add(crearPregunta(
                    "¿Cómo calificarías al PathMentor asignado en tu entrevista?",
                    "RATING",
                    true
            ));

            preguntas.add(crearPregunta(
                    "¿Recomendarías la plataforma PathFinder a otros estudiantes?",
                    "RATING",
                    true
            ));

            preguntas.add(crearPregunta(
                    "¿Tienes algún comentario, observación o sugerencia de mejora?",
                    "TEXT",
                    false
            ));

            preguntaEncuestaRepository.saveAll(preguntas);
            log.info("¡Se sembraron {} preguntas de encuesta exitosamente!", preguntas.size());
        } else {
            log.info("La tabla de preguntas de la encuesta ya contiene las 6 preguntas necesarias. Omitiendo siembra.");
        }
    }

    private PreguntaEncuesta crearPregunta(String texto, String tipo, boolean obligatoria) {
        PreguntaEncuesta p = new PreguntaEncuesta();
        p.setTextoPregunta(texto);
        p.setTipoPregunta(tipo);
        p.setObligatoria(obligatoria);
        p.setActivo(true);
        return p;
    }
}
