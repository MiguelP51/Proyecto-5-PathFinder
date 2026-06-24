package com.pathfinder.config;

import com.pathfinder.model.entity.Competencia;
import com.pathfinder.repository.CompetenciaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CompetenciaDataInitializer implements CommandLineRunner {

    private final CompetenciaRepository competenciaRepository;

    @Override
    public void run(String... args) {
        if (competenciaRepository.count() == 0) {
            log.info("Sembrando catalogo de competencias por puesto (Factorial LATAM)...");
            List<Competencia> comps = new ArrayList<>();

            // 1. Resolucion de problemas
            comps.add(crearComp(
                "Resolucion de problemas",
                "Capacidad para identificar problemas y encontrar soluciones efectivas basadas en datos.",
                "Muestra poca o ninguna capacidad para reconocer objetivos y motivaciones. Se refiere a pruebas anecdoticas (\"de oidas\", experiencias personales) mas que a datos e informacion concretos.",
                "Busca datos e informacion fiables para fundamentar las decisiones y sugerir cambios.",
                "Piense en terminos objetivos, de prioridades, cuellos de botella y formas de probar las hipotesis.",
                "Los comportamientos y las acciones demuestran una clara comprension de los objetivos, las prioridades y el mejor curso de accion dentro de las limitaciones existentes. Busca informacion fiable para validar las hipotesis.",
                "General"
            ));

            // 2. Comunicacion
            comps.add(crearComp(
                "Comunicacion",
                "Habilidad para transmitir y recibir ideas de manera clara y asertiva.",
                "No sabe escuchar, interrumpe constantemente a las personas o ignora lo que dicen y/o es incapaz de crear una conexion con el interlocutor.",
                "Sabe escuchar y exponer sus ideas en respuesta al interlocutor, aunque le falte claridad o ingenio en la forma de expresarse.",
                "Sabe estructurar sus ideas con claridad, se expresa bien y es capaz de identificar los ruidos en la comunicacion, haciendo todo lo posible por minimizarlos.",
                "Se expresa de forma asertiva, organizando el razonamiento de forma logica y atractiva. Objetivo, seguro al hablar y proactivo para evitar la falta de comunicacion.",
                "General"
            ));

            // 3. Capacidad analitica
            comps.add(crearComp(
                "Capacidad analitica",
                "Pensamiento critico y evaluacion cientifica de escenarios.",
                "No demuestra pensamiento critico ni curiosidad y basa sus acciones en intuiciones o suposiciones.",
                "Se cuestiona, trata de evaluar diferentes escenarios posibles y busca recopilar informacion de fuentes fiables para fundamentar sus acciones.",
                "Sabe trazar, recopilar y combinar informacion de diferentes fuentes para llegar a una mejor comprension de cada situacion antes de ponerse a resolver el problema.",
                "A partir del analisis de la informacion, asume una postura orientada a los resultados y es capaz de dirigir su trabajo de forma mas estrategica hacia los objetivos de la empresa.",
                "General"
            ));

            // 4. Trabajo en equipo
            comps.add(crearComp(
                "Trabajo en equipo",
                "Colaboracion efectiva y apoyo continuo a los companeros.",
                "No participa activamente en actividades de equipo; tiene poco interes o capacidad para trabajar con otros.",
                "Demuestra saber cooperar y trabajar bien con sus colegas en diferentes entornos.",
                "Se compromete activamente y solicita ideas de otros miembros del equipo y sabe como incorporar esas contribuciones.",
                "Muestra una vision profunda de la eficacia de todo el equipo y toma medidas para mejorarla continuamente (resuelve conflictos, ensena a los companeros, etc.).",
                "General"
            ));

            // 5. Liderazgo
            comps.add(crearComp(
                "Liderazgo",
                "Capacidad para guiar, inspirar e influir positivamente en otros.",
                "Muestra poca inclinacion a asumir cualquier papel de liderazgo, incluso los informales.",
                "Trabaja con otros para acordar una direccion comun; aclara los objetivos y los posibles obstaculos.",
                "Sabe como liderar pequenos grupos para conseguir objetivos y retos comunes.",
                "Va mas alla de las expectativas normales en situaciones desafiantes para inspirar a sus colegas y companeros a lograr resultados imprevistos.",
                "General"
            ));

            // 6. Empatia
            comps.add(crearComp(
                "Empatia",
                "Comprension de los sentimientos, preocupaciones y motivaciones de los demas.",
                "Demuestra sistematicamente poca conciencia de los sentimientos, preocupaciones o motivaciones de los demas.",
                "Puede comprender pensamientos o sentimientos no expresados verbalmente.",
                "Comprende con precision las razones de los pensamientos y sentimientos no expresados verbalmente.",
                "Los comportamientos and las acciones demuestran una conciencia y una comprension constantes de los pensamientos y sentimientos de los demas.",
                "General"
            ));

            // 7. Proactividad
            comps.add(crearComp(
                "Proactividad",
                "Iniciativa propia para hacer que las cosas sucedan y asumir responsabilidad.",
                "Siempre crees que el responsable es otro: el jefe, un companero, otro equipo, el cliente, etc.",
                "Cuando se le autoriza o se le anima, es capaz de hacer que las cosas sucedan mas alla del ambito definido previamente en sus actividades.",
                "Demuestra la intencion de salirse de su papel para asegurar que las cosas sucedan entre los equipos (incluso si se siente incomodo por ello).",
                "Se posiciona como el principal responsable del exito de la tarea que tiene entre manos, independientemente de los titulos, las funciones o la jerarquia.",
                "General"
            ));

            // 8. Resiliencia
            comps.add(crearComp(
                "Resiliencia",
                "Flexibilidad y control emocional para afrontar la presion y el cambio.",
                "No demuestra flexibilidad ni confianza en su capacidad para afrontar la incertidumbre y/o los escenarios ambiguos.",
                "Entiende el cambio como algo necesario y es capaz de adaptarse a los nuevos escenarios que surgen inesperadamente en el entorno de trabajo.",
                "Puede manejar positivamente la presion, el conflicto, la incertidumbre y la retroalimentacion negativa. En estas situaciones sigue siendo productiva y centrada en sus demandas.",
                "Tiene control emocional cuando se enfrenta a situaciones conflictivas, entiende los retos y las crisis como una oportunidad de crecimiento y siempre busca aprender y desarrollarse profesionalmente.",
                "General"
            ));

            // Tambien agregaremos copias especificas para "Recursos Humanos"
            for (Competencia c : comps) {
                Competencia rhComp = crearComp(
                    c.getNombre(),
                    c.getDescripcion(),
                    c.getNivel0(),
                    c.getNivel1(),
                    c.getNivel2(),
                    c.getNivel3(),
                    "Recursos Humanos"
                );
                competenciaRepository.save(rhComp);
            }

            // Guardar las generales tambien
            competenciaRepository.saveAll(comps);
            log.info("¡Se sembraron {} competencias exitosamente!", comps.size() * 2);
        }
    }

    private Competencia crearComp(String nombre, String desc, String n0, String n1, String n2, String n3, String puesto) {
        Competencia c = new Competencia();
        c.setNombre(nombre);
        c.setDescripcion(desc);
        c.setNivel0(n0);
        c.setNivel1(n1);
        c.setNivel2(n2);
        c.setNivel3(n3);
        c.setPuesto(puesto);
        c.setActivo(true);
        return c;
    }
}
