package com.pathfinder.config;

import com.pathfinder.model.entity.AreaEntrevista;
import com.pathfinder.model.entity.PuestoEntrevista;
import com.pathfinder.repository.AreaEntrevistaRepository;
import com.pathfinder.repository.PuestoEntrevistaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AreaPuestoEntrevistaInitializer implements CommandLineRunner {

    private final AreaEntrevistaRepository areaRepository;
    private final PuestoEntrevistaRepository puestoRepository;

    @Override
    public void run(String... args) {
        if (areaRepository.count() == 0) {
            log.info("Sembrando áreas y puestos de entrevista iniciales...");

            Map<String, List<String>> areaPuestosMap = new HashMap<>();

            areaPuestosMap.put("Recursos Humanos", List.of(
                    "Practicante de Recursos Humanos",
                    "Analista de Gestión de Talento",
                    "Analista de Clima y Cultura",
                    "Asistente de Selección"
            ));

            areaPuestosMap.put("Marketing", List.of(
                    "Practicante de Marketing",
                    "Analista de Marketing Digital",
                    "Analista de Producto / Brand Assistant",
                    "Analista de Trade Marketing"
            ));

            areaPuestosMap.put("Finanzas y Contabilidad", List.of(
                    "Practicante de Finanzas",
                    "Analista Financiero",
                    "Analista de Tesorería",
                    "Analista de Control de Gestión"
            ));

            areaPuestosMap.put("Gestión y Alta Dirección / Consultoría", List.of(
                    "Consultor Junior de Negocios",
                    "Analista de Procesos"
            ));

            for (Map.Entry<String, List<String>> entry : areaPuestosMap.entrySet()) {
                AreaEntrevista area = new AreaEntrevista();
                area.setNombre(entry.getKey());
                area.setActivo(true);
                AreaEntrevista savedArea = areaRepository.save(area);

                List<PuestoEntrevista> puestos = new ArrayList<>();
                for (String puestoNombre : entry.getValue()) {
                    PuestoEntrevista p = new PuestoEntrevista();
                    p.setNombre(puestoNombre);
                    p.setArea(savedArea);
                    p.setActivo(true);
                    puestos.add(p);
                }
                puestoRepository.saveAll(puestos);
            }

            log.info("¡Se sembraron {} áreas de entrevista con sus respectivos puestos!", areaPuestosMap.size());
        }
    }
}
