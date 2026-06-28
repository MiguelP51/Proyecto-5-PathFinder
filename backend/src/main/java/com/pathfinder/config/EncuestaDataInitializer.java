package com.pathfinder.config;

import com.pathfinder.model.entity.PreguntaEncuesta;
import com.pathfinder.repository.PreguntaEncuestaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class EncuestaDataInitializer implements CommandLineRunner {

    private final PreguntaEncuestaRepository preguntaEncuestaRepository;

    @Override
    public void run(String... args) {
        log.info("Iniciando verificación y siembra de preguntas de encuesta...");
        
        List<PreguntaEncuestaTemplate> templates = List.of(
            new PreguntaEncuestaTemplate("¿Cómo calificarías tu experiencia general con la plataforma PathFinder?", "RATING", true),
            new PreguntaEncuestaTemplate("¿Qué tan útil te resultó la evaluación psicométrica y test DISC?", "RATING", true),
            new PreguntaEncuestaTemplate("¿Qué tan útil te resultó la simulación de entrevista con tu PathMentor?", "RATING", true),
            new PreguntaEncuestaTemplate("¿Cómo calificarías al PathMentor asignado en tu entrevista?", "RATING", true),
            new PreguntaEncuestaTemplate("¿Recomendarías la plataforma PathFinder a otros estudiantes?", "RATING", true),
            new PreguntaEncuestaTemplate("¿Tienes algún comentario, observación o sugerencia de mejora?", "TEXT", false)
        );

        for (PreguntaEncuestaTemplate temp : templates) {
            List<PreguntaEncuesta> existing = preguntaEncuestaRepository.findAll().stream()
                .filter(p -> p.getTextoPregunta().trim().equalsIgnoreCase(temp.texto.trim()))
                .collect(Collectors.toList());

            if (existing.isEmpty()) {
                PreguntaEncuesta p = new PreguntaEncuesta();
                p.setTextoPregunta(temp.texto);
                p.setTipoPregunta(temp.tipo);
                p.setObligatoria(temp.obligatoria);
                p.setActivo(true);
                preguntaEncuestaRepository.save(p);
                log.info("Pregunta sembrada: {}", temp.texto);
            } else {
                boolean first = true;
                for (PreguntaEncuesta p : existing) {
                    if (first) {
                        if (!Boolean.TRUE.equals(p.getActivo())) {
                            p.setActivo(true);
                            preguntaEncuestaRepository.save(p);
                        }
                        first = false;
                    } else {
                        if (!Boolean.FALSE.equals(p.getActivo())) {
                            p.setActivo(false);
                            preguntaEncuestaRepository.save(p);
                            log.info("Pregunta duplicada desactivada (soft-deleted): ID {}", p.getIdPregunta());
                        }
                    }
                }
            }
        }
        log.info("Fin de inicialización de preguntas de encuesta.");
    }

    private static class PreguntaEncuestaTemplate {
        String texto;
        String tipo;
        boolean obligatoria;
        PreguntaEncuestaTemplate(String t, String tp, boolean o) {
            this.texto = t;
            this.tipo = tp;
            this.obligatoria = o;
        }
    }
}
