package com.pathfinder.service.impl;

import com.pathfinder.dto.response.DashboardResumenDTO;
import com.pathfinder.model.entity.PerfilEntrenamiento;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.repository.PerfilCVHabilidadRepository;
import com.pathfinder.repository.PerfilEntrenamientoRepository;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.repository.PerfilCVRepository;
import com.pathfinder.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilEntrenamientoRepository perfilEntrenamientoRepository;
    private final PerfilCVRepository perfilCVRepository;
    private final PerfilCVHabilidadRepository perfilCVHabilidadRepository;

    @Override
    public DashboardResumenDTO obtenerResumen(String correoUsuario) {
        // 1. Obtener usuario
        Usuario usuario = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + correoUsuario));

        // 2. Obtener o crear perfil de entrenamiento
        PerfilEntrenamiento perfil = perfilEntrenamientoRepository
                .findByUsuario_Correo(correoUsuario)
                .orElseGet(() -> crearPerfilInicial(usuario));

        // 3. Obtener habilidades del CV (reutilizamos lo que ya existe)
        List<DashboardResumenDTO.HabilidadDashboardDTO> habilidades = Collections.emptyList();
        try {
            var perfilCV = perfilCVRepository.findByUsuario_Correo(correoUsuario);
            if (perfilCV.isPresent()) {
                habilidades = perfilCVHabilidadRepository
                        .findByPerfilCv_IdPerfilCv(perfilCV.get().getIdPerfilCv())
                        .stream()
                        .limit(6) // Máximo 6 habilidades en el dashboard
                        .map(ph -> DashboardResumenDTO.HabilidadDashboardDTO.builder()
                                .nombre(ph.getHabilidad().getNombreHabilidad())
                                .tipo(ph.getHabilidad().getTipoHabilidad().name())
                                .nivel(ph.getNivel().name())
                                .build())
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.warn("No se pudieron obtener habilidades del CV para {}: {}", correoUsuario, e.getMessage());
        }

        // 4. Armar respuesta
        return DashboardResumenDTO.builder()
                .nombre(usuario.getNombreCompleto())
                .avatar(usuario.getAvatarUrl())
                .correo(usuario.getCorreo())
                .xpTotal(perfil.getXpTotal())
                .nivel(perfil.getNivel())
                .xpSiguienteNivel(perfil.getXpSiguienteNivel())
                .exploracionIniciada(perfil.getExploracionIniciada())
                .habilidades(habilidades)
                .build();
    }

    @Override
    @Transactional
    public void iniciarExploracion(String correoUsuario) {
        Usuario usuario = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + correoUsuario));

        PerfilEntrenamiento perfil = perfilEntrenamientoRepository
                .findByUsuario_Correo(correoUsuario)
                .orElseGet(() -> crearPerfilInicial(usuario));

        if (!perfil.getExploracionIniciada()) {
            perfil.setExploracionIniciada(true);
            perfilEntrenamientoRepository.save(perfil);
            log.info("Exploración iniciada para usuario: {}", correoUsuario);
        }
    }

    // Crea un perfil de entrenamiento inicial para el usuario
    private PerfilEntrenamiento crearPerfilInicial(Usuario usuario) {
        PerfilEntrenamiento nuevo = new PerfilEntrenamiento();
        nuevo.setUsuario(usuario);
        nuevo.setXpTotal(0);
        nuevo.setNivel(1);
        nuevo.setXpSiguienteNivel(1000);
        nuevo.setExploracionIniciada(false);
        return perfilEntrenamientoRepository.save(nuevo);
    }
}
