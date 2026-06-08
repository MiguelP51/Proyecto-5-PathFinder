package com.pathfinder.config;

import com.pathfinder.model.entity.Feriado;
import com.pathfinder.repository.FeriadoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class FeriadoInitializer {

    private final FeriadoRepository feriadoRepository;

    @EventListener
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (feriadoRepository.count() == 0) {
            log.info("Inicializando feriados nacionales de Perú para el 2026 y 2027...");

            List<Feriado> feriados = List.of(
                    // 2026
                    crearFeriado(LocalDate.of(2026, 1, 1), "Año Nuevo"),
                    crearFeriado(LocalDate.of(2026, 4, 2), "Jueves Santo"),
                    crearFeriado(LocalDate.of(2026, 4, 3), "Viernes Santo"),
                    crearFeriado(LocalDate.of(2026, 5, 1), "Día del Trabajo"),
                    crearFeriado(LocalDate.of(2026, 6, 29), "San Pedro y San Pablo"),
                    crearFeriado(LocalDate.of(2026, 7, 23), "Día de la Fuerza Aérea del Perú"),
                    crearFeriado(LocalDate.of(2026, 7, 28), "Fiestas Patrias - Independencia del Perú"),
                    crearFeriado(LocalDate.of(2026, 7, 29), "Fiestas Patrias - Gran Parada Militar"),
                    crearFeriado(LocalDate.of(2026, 8, 6), "Batalla de Junín"),
                    crearFeriado(LocalDate.of(2026, 8, 30), "Santa Rosa de Lima"),
                    crearFeriado(LocalDate.of(2026, 10, 8), "Combate de Angamos"),
                    crearFeriado(LocalDate.of(2026, 11, 1), "Día de todos los Santos"),
                    crearFeriado(LocalDate.of(2026, 12, 8), "Inmaculada Concepción"),
                    crearFeriado(LocalDate.of(2026, 12, 9), "Batalla de Ayacucho"),
                    crearFeriado(LocalDate.of(2026, 12, 25), "Navidad"),

                    // 2027
                    crearFeriado(LocalDate.of(2027, 1, 1), "Año Nuevo"),
                    crearFeriado(LocalDate.of(2027, 3, 25), "Jueves Santo"),
                    crearFeriado(LocalDate.of(2027, 3, 26), "Viernes Santo"),
                    crearFeriado(LocalDate.of(2027, 5, 1), "Día del Trabajo"),
                    crearFeriado(LocalDate.of(2027, 6, 29), "San Pedro y San Pablo"),
                    crearFeriado(LocalDate.of(2027, 7, 23), "Día de la Fuerza Aérea del Perú"),
                    crearFeriado(LocalDate.of(2027, 7, 28), "Fiestas Patrias - Independencia del Perú"),
                    crearFeriado(LocalDate.of(2027, 7, 29), "Fiestas Patrias - Gran Parada Militar"),
                    crearFeriado(LocalDate.of(2027, 8, 6), "Batalla de Junín"),
                    crearFeriado(LocalDate.of(2027, 8, 30), "Santa Rosa de Lima"),
                    crearFeriado(LocalDate.of(2027, 10, 8), "Combate de Angamos"),
                    crearFeriado(LocalDate.of(2027, 11, 1), "Día de todos los Santos"),
                    crearFeriado(LocalDate.of(2027, 12, 8), "Inmaculada Concepción"),
                    crearFeriado(LocalDate.of(2027, 12, 9), "Batalla de Ayacucho"),
                    crearFeriado(LocalDate.of(2027, 12, 25), "Navidad")
            );

            feriadoRepository.saveAll(feriados);
            log.info("Feriados inicializados exitosamente.");
        }
    }

    private Feriado crearFeriado(LocalDate fecha, String descripcion) {
        Feriado f = new Feriado();
        f.setFecha(fecha);
        f.setDescripcion(descripcion);
        f.setActivo(true);
        return f;
    }
}
