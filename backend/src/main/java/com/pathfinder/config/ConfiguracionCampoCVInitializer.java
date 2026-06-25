package com.pathfinder.config;

import com.pathfinder.model.entity.ConfiguracionCampoCV;
import com.pathfinder.repository.ConfiguracionCampoCVRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ConfiguracionCampoCVInitializer implements CommandLineRunner {

    private final ConfiguracionCampoCVRepository configuracionCampoCVRepository;

    @Override
    public void run(String... args) {
        if (configuracionCampoCVRepository.count() == 0) {
            log.info("Sembrando campos de CV iniciales...");
            List<ConfiguracionCampoCV> campos = new ArrayList<>();

            campos.add(crearCampo("celular", "Celular", "TEXT", true, 0));
            campos.add(crearCampo("correoContacto", "Correo de Contacto", "TEXT", true, 1));
            campos.add(crearCampo("provincia", "Provincia", "TEXT", true, 2));
            campos.add(crearCampo("distrito", "Distrito", "TEXT", true, 3));
            campos.add(crearCampo("linkedinUrl", "LinkedIn URL", "TEXT", false, 4));
            campos.add(crearCampo("perfilProfesional", "Perfil Profesional (Resumen)", "TEXTAREA", false, 5));
            campos.add(crearCampo("interesesProfesionales", "Área/Puesto de Interés", "TEXTAREA", false, 6));
            campos.add(crearCampo("objetivosLaborales", "Objetivos Laborales", "TEXTAREA", false, 7));

            configuracionCampoCVRepository.saveAll(campos);
            log.info("¡Se sembraron {} campos de CV iniciales exitosamente!", campos.size());
        }
    }

    private ConfiguracionCampoCV crearCampo(String clave, String label, String tipo, boolean requerido, int orden) {
        ConfiguracionCampoCV c = new ConfiguracionCampoCV();
        c.setClave(clave);
        c.setLabel(label);
        c.setTipo(tipo);
        c.setRequerido(requerido);
        c.setActivo(true);
        c.setOrden(orden);
        c.setEsCustom(false);
        return c;
    }
}
