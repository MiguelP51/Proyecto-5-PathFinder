package com.pathfinder.config;

import com.pathfinder.model.entity.*;
import com.pathfinder.model.enums.TipoHabilidad;
import com.pathfinder.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class PathChallengeDataInitializer implements CommandLineRunner {

    private final AreaRepository areaRepository;
    private final SubAreaRepository subAreaRepository;
    private final HabilidadRepository habilidadRepository;
    private final PathChallengeRepository pathChallengeRepository;
    private final PathChallengeTaskRepository pathChallengeTaskRepository;

    @Override
    public void run(String... args) {
        if (pathChallengeRepository.count() == 0) {
            log.info("Sembrando desafio funcional de Recursos Humanos (Reclutamiento y seleccion)...");

            // 1. Obtener o crear el Area de Recursos Humanos
            Area areaRH = areaRepository.findById("recursos-humanos")
                    .orElseGet(() -> {
                        Area area = new Area();
                        area.setIdArea("recursos-humanos");
                        area.setNombre("Recursos Humanos");
                        area.setEmoji("👥");
                        area.setDescripcion("Gestion del talento humano y desarrollo organizacional.");
                        area.setActivo(true);
                        return areaRepository.save(area);
                    });

            // 2. Obtener o crear la SubArea de Reclutamiento y Selección
            SubArea subAreaRH = subAreaRepository.findByAreaId("recursos-humanos").stream()
                    .filter(sa -> "reclutamiento-y-seleccion".equalsIgnoreCase(sa.getSlug()))
                    .findFirst()
                    .orElseGet(() -> {
                        SubArea sa = new SubArea();
                        sa.setSlug("reclutamiento-y-seleccion");
                        sa.setNombre("Reclutamiento y Seleccion");
                        sa.setEmoji("🎯");
                        sa.setAreaId(areaRH.getIdArea());
                        sa.setAreaNombre(areaRH.getNombre());
                        sa.setAreaEmoji(areaRH.getEmoji());
                        sa.setDescripcion("Aprende a gestionar el talento humano y desarrollar estrategias de reclutamiento y seleccion.");
                        sa.setObjetivos("Dominar metodologias de reclutamiento, entrevistas, y uso de herramientas ATS.");
                        sa.setHabilidadesRelacionadas("Comunicacion, Entrevistas, Evaluacion de perfiles");
                        sa.setNivel("Principiante");
                        sa.setCantidadSkillPaths(0);
                        sa.setCantidadPathChallenges(1);
                        sa.setActivo(true);
                        return subAreaRepository.save(sa);
                    });

            // 3. Obtener o crear Habilidades
            Habilidad habComunicacion = habilidadRepository.findByNombreHabilidadIgnoreCase("Comunicacion")
                    .orElseGet(() -> {
                        Habilidad h = new Habilidad();
                        h.setNombreHabilidad("Comunicacion");
                        h.setTipoHabilidad(TipoHabilidad.BLANDA);
                        h.setActivo(true);
                        return habilidadRepository.save(h);
                    });

            Habilidad habEntrevistas = habilidadRepository.findByNombreHabilidadIgnoreCase("Entrevistas")
                    .orElseGet(() -> {
                        Habilidad h = new Habilidad();
                        h.setNombreHabilidad("Entrevistas");
                        h.setTipoHabilidad(TipoHabilidad.TECNICA);
                        h.setActivo(true);
                        return habilidadRepository.save(h);
                    });

            // 4. Crear el PathChallenge
            PathChallenge challenge = new PathChallenge();
            challenge.setTitulo("Caso Practico: Diseno de un Proceso de Seleccion");
            challenge.setDificultad("Media");
            challenge.setXp(150);
            challenge.setEstado("Publicada");
            challenge.setCompletadas(0);
            challenge.setSubArea(subAreaRH);
            challenge.setHabilidades(List.of(habComunicacion, habEntrevistas));
            challenge.setActivo(true);
            challenge = pathChallengeRepository.save(challenge);

            // 5. Crear las tareas asociadas al PathChallenge
            List<PathChallengeTask> tasks = new ArrayList<>();

            tasks.add(crearTask(challenge, 
                "Definicion del Perfil de Puesto: Disena el perfil de puesto para un Gestor de Talento Humano Jr., especificando las competencias clave (tanto duras como blandas) y los requisitos minimos.", 
                1));

            tasks.add(crearTask(challenge, 
                "Diseno de la Estrategia de Atraccion de Talento: Propon los canales de difusion idoneos (bolsa de trabajo, LinkedIn, etc.) y redacta el anuncio de empleo atractivo para la vacante.", 
                2));

            tasks.add(crearTask(challenge, 
                "Estructura de la Entrevista y Rubrica de Evaluacion: Elabora una guia de entrevista semi-estructurada con preguntas situacionales y la rubrica factorial de evaluacion (niveles 0-3).", 
                3));

            pathChallengeTaskRepository.saveAll(tasks);

            // Actualizar contador del subarea
            subAreaRH.setCantidadPathChallenges(1);
            subAreaRepository.save(subAreaRH);

            log.info("¡Se sembro el PathChallenge de Recursos Humanos exitosamente!");
        } else {
            log.info("La tabla de PathChallenge ya contiene datos. Omitiendo siembra.");
        }
    }

    private PathChallengeTask crearTask(PathChallenge challenge, String descripcion, int orden) {
        PathChallengeTask t = new PathChallengeTask();
        t.setPathChallenge(challenge);
        t.setDescripcion(descripcion);
        t.setOrden(orden);
        t.setActivo(true);
        return t;
    }
}
