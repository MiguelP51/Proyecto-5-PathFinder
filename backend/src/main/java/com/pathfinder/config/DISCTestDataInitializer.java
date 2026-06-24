package com.pathfinder.config;

import com.pathfinder.model.entity.OpcionPreguntaDISC;
import com.pathfinder.model.entity.PreguntaDISC;
import com.pathfinder.model.entity.TipoPreguntaDISC;
import com.pathfinder.model.enums.CategoriaDISC;
import com.pathfinder.repository.OpcionPreguntaDISCRepository;
import com.pathfinder.repository.PreguntaDISCRepository;
import com.pathfinder.repository.TipoPreguntaDISCRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DISCTestDataInitializer implements CommandLineRunner {

    private final PreguntaDISCRepository preguntaDISCRepository;
    private final OpcionPreguntaDISCRepository opcionPreguntaDISCRepository;
    private final TipoPreguntaDISCRepository tipoPreguntaDISCRepository;

    @Override
    public void run(String... args) {
        long count = preguntaDISCRepository.count();
        boolean needsReseed = count != 20;
        if (!needsReseed) {
            java.util.Optional<PreguntaDISC> firstOpt = preguntaDISCRepository.findAll().stream().findFirst();
            if (firstOpt.isPresent() && !firstOpt.get().getEnunciado().startsWith("Bloque")) {
                needsReseed = true;
            }
        }

        if (needsReseed) {
            log.info("Sembrando preguntas iniciales del test DISC...");
            
            // 1. Obtener o crear TipoPreguntaDISC SELECCION
            TipoPreguntaDISC tipo = tipoPreguntaDISCRepository.findByCodigoAndActivoTrue("SELECCION")
                    .orElseGet(() -> {
                        TipoPreguntaDISC t = new TipoPreguntaDISC();
                        t.setCodigo("SELECCION");
                        t.setNombre("Seleccion de opcion");
                        t.setDescripcion("Seleccion de una opcion unica");
                        t.setNumeroOpciones(4);
                        t.setActivo(true);
                        return tipoPreguntaDISCRepository.save(t);
                    });

            // 2. Limpiar base de datos si ya tiene preguntas viejas
            opcionPreguntaDISCRepository.deleteAll();
            preguntaDISCRepository.deleteAll();

            // 3. Crear los 20 bloques
            // Cada bloque tiene 4 palabras para D, I, S, C
            String[][] bloquesMas = {
                {"Ejecutor", "Relacionador", "Servicial", "Organizador"},
                {"Directo", "Apasionado", "Estable", "Preciso"},
                {"Controlador", "Popular", "Aceptado", "Cumplido"},
                {"Impulsor", "Magnetico", "Estable", "Cuidadoso"},
                {"Iniciador", "Persuasivo", "Pasivo", "Analitico"},
                {"Competitivo", "Sociable", "Leal", "Exacto"},
                {"Arriesgado", "Efusivo", "Finiquitador", "Factico (Dado a los hechos)"},
                {"Exigente", "Alegre", "Tranquilo", "Responsable"},
                {"Ambicioso", "Politico", "Autocontrolado", "Cauteloso"},
                {"Pionero", "Entusiasta", "Pausado", "Conservador"}
            };

            String[][] bloquesMenos = {
                {"Conservador", "Reflexivo", "Versatil", "Flexible"},
                {"Indeciso", "Calculador", "Alerta", "Servicial"},
                {"Inseguro", "Logico", "Demostrativo", "Desinhibido"},
                {"Suave", "Suspicaz", "Preciso", "Creativo"},
                {"Modesto", "Incisivo", "Flexible", "Intenso"},
                {"Calculador", "Racional", "Activo", "Independiente"},
                {"Moderado", "Esceptico", "Ignorador", "Apasionado"},
                {"Complaciente", "Inexpresivo", "Impaciente", "Confiado"},
                {"Pacifico", "Pesimista", "Impulsivo", "Expresivo"},
                {"Agradable", "Parco", "Ansioso", "Poetico"}
            };

            List<PreguntaDISC> preguntas = new ArrayList<>();

            // Sembrar bloques MAS (1-10)
            for (int i = 0; i < 10; i++) {
                PreguntaDISC p = new PreguntaDISC();
                p.setEnunciado("Bloque " + (i + 1) + ". Me considero más:");
                p.setTipoPreguntaDisc(tipo);
                p.setOrdenPregunta(i + 1);
                p.setCategoriaDisc(CategoriaDISC.D); // Dummy default
                p.setObligatoria(true);
                p.setActivo(true);

                // Agregar opciones
                p.getOpciones().add(crearOpcion(p, bloquesMas[i][0], CategoriaDISC.D, 1, 1));
                p.getOpciones().add(crearOpcion(p, bloquesMas[i][1], CategoriaDISC.I, 2, 2));
                p.getOpciones().add(crearOpcion(p, bloquesMas[i][2], CategoriaDISC.S, 3, 3));
                p.getOpciones().add(crearOpcion(p, bloquesMas[i][3], CategoriaDISC.C, 4, 4));

                preguntas.add(p);
            }

            // Sembrar bloques MENOS (11-20)
            for (int i = 0; i < 10; i++) {
                PreguntaDISC p = new PreguntaDISC();
                p.setEnunciado("Bloque " + (i + 11) + ". Me considero menos:");
                p.setTipoPreguntaDisc(tipo);
                p.setOrdenPregunta(i + 11);
                p.setCategoriaDisc(CategoriaDISC.D); // Dummy default
                p.setObligatoria(true);
                p.setActivo(true);

                // Agregar opciones
                p.getOpciones().add(crearOpcion(p, bloquesMenos[i][0], CategoriaDISC.D, 1, 1));
                p.getOpciones().add(crearOpcion(p, bloquesMenos[i][1], CategoriaDISC.I, 2, 2));
                p.getOpciones().add(crearOpcion(p, bloquesMenos[i][2], CategoriaDISC.S, 3, 3));
                p.getOpciones().add(crearOpcion(p, bloquesMenos[i][3], CategoriaDISC.C, 4, 4));

                preguntas.add(p);
            }

            preguntaDISCRepository.saveAll(preguntas);
            log.info("¡Se sembraron {} bloques de preguntas DISC exitosamente!", preguntas.size());
        } else {
            log.info("El test DISC ya cuenta con {} preguntas sembradas con el formato correcto. Omitiendo siembra.", count);
        }
    }

    private OpcionPreguntaDISC crearOpcion(PreguntaDISC p, String texto, CategoriaDISC cat, int valor, int orden) {
        OpcionPreguntaDISC o = new OpcionPreguntaDISC();
        o.setPreguntaDisc(p);
        o.setTextoOpcion(texto);
        o.setCategoriaDisc(cat);
        o.setValorRespuesta(valor);
        o.setOrdenOpcion(orden);
        o.setActivo(true);
        return o;
    }
}
