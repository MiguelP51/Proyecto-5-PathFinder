package com.pathfinder.service.impl;

import com.pathfinder.model.entity.UsuarioPathChallenge;
import com.pathfinder.model.entity.UsuarioSkillPath;
import com.pathfinder.repository.UsuarioPathChallengeRepository;
import com.pathfinder.repository.UsuarioSkillPathRepository;
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

    private static final int XP_BASE_POR_NIVEL = 1000;

    private final UsuarioRepository usuarioRepository;
    private final PerfilEntrenamientoRepository perfilEntrenamientoRepository;
    private final PerfilCVRepository perfilCVRepository;
    private final PerfilCVHabilidadRepository perfilCVHabilidadRepository;
    private final UsuarioSkillPathRepository usuarioSkillPathRepository;
    private final UsuarioPathChallengeRepository usuarioPathChallengeRepository;

    @Override
    @Transactional
    public DashboardResumenDTO obtenerResumen(String correoUsuario) {
        // 1. Obtener usuario
        Usuario usuario = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + correoUsuario));

        // 2. Obtener o crear perfil de entrenamiento
        PerfilEntrenamiento perfil = perfilEntrenamientoRepository
                .findByUsuario_Correo(correoUsuario)
                .orElseGet(() -> crearPerfilInicial(usuario));
        sincronizarPerfilConAvances(perfil, correoUsuario);

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

    private void sincronizarPerfilConAvances(
            PerfilEntrenamiento perfil,
            String correoUsuario
    ) {
        int xpSkillPaths = usuarioSkillPathRepository
                .findSkillPathsIniciadosByUsuarioCorreo(correoUsuario)
                .stream()
                .filter(this::esSkillPathConXp)
                .map(UsuarioSkillPath::getSkillPath)
                .filter(skillPath -> skillPath != null && skillPath.getXp() != null)
                .mapToInt(skillPath -> skillPath.getXp())
                .sum();

        int xpPathChallenges = usuarioPathChallengeRepository
                .findIniciadosByUsuarioCorreo(correoUsuario)
                .stream()
                .filter(this::esPathChallengeConXp)
                .map(UsuarioPathChallenge::getPathChallenge)
                .filter(pathChallenge -> pathChallenge != null && pathChallenge.getXp() != null)
                .mapToInt(pathChallenge -> pathChallenge.getXp())
                .sum();

        int xpTotalCalculado = xpSkillPaths + xpPathChallenges;

        perfil.setXpTotal(xpTotalCalculado);
        recalcularNivel(perfil);
        perfilEntrenamientoRepository.save(perfil);
    }

    private boolean esSkillPathConXp(UsuarioSkillPath avance) {
        if (avance == null || avance.getEstado() == null) {
            return false;
        }

        return "VALIDADO".equalsIgnoreCase(avance.getEstado());
    }

    private boolean esPathChallengeConXp(UsuarioPathChallenge avance) {
        if (avance == null || avance.getEstado() == null) {
            return false;
        }

        return "COMPLETADO".equalsIgnoreCase(avance.getEstado());
    }

    private void recalcularNivel(PerfilEntrenamiento perfil) {
        int nivel = 1;
        int xpTotal = perfil.getXpTotal() != null ? perfil.getXpTotal() : 0;
        int umbralSiguiente = XP_BASE_POR_NIVEL;

        while (xpTotal >= umbralSiguiente) {
            nivel++;
            umbralSiguiente += XP_BASE_POR_NIVEL * nivel;
        }

        perfil.setNivel(nivel);
        perfil.setXpSiguienteNivel(umbralSiguiente);
    }
}
