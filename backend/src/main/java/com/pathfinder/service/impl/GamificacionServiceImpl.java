package com.pathfinder.service.impl;

import com.pathfinder.model.entity.Insignia;
import com.pathfinder.model.entity.PerfilEntrenamiento;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.repository.InsigniaRepository;
import com.pathfinder.repository.PerfilEntrenamientoRepository;
import com.pathfinder.repository.UsuarioPathChallengeRepository;
import com.pathfinder.service.GamificacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GamificacionServiceImpl implements GamificacionService {

    // ---------------------------------------------------------------
    // Reglas fijas de nivel
    // ---------------------------------------------------------------
    // XP necesario para subir del nivel N al N+1 = 1000 * N (umbral creciente)
    private static final int XP_BASE_POR_NIVEL = 1000;

    // ---------------------------------------------------------------
    // Reglas fijas de insignias (catálogo en código, no en BD/admin)
    // ---------------------------------------------------------------
    private static final String INSIGNIA_PRIMERA_MISION = "Primera misión";
    private static final String INSIGNIA_RACHA_3 = "Racha de 3";
    private static final String INSIGNIA_NIVEL_5 = "Nivel 5";

    private static final DateTimeFormatter FORMATO_FECHA =
            DateTimeFormatter.ofPattern("d/M/yyyy");

    private final PerfilEntrenamientoRepository perfilEntrenamientoRepository;
    private final InsigniaRepository insigniaRepository;
    private final UsuarioPathChallengeRepository usuarioPathChallengeRepository;

    @Override
    @Transactional
    public void sumarXp(Usuario usuario, Integer xpGanado) {
        if (xpGanado == null || xpGanado <= 0) {
            return;
        }

        PerfilEntrenamiento perfil = obtenerOCrearPerfil(usuario);

        int xpNuevo = perfil.getXpTotal() + xpGanado;
        perfil.setXpTotal(xpNuevo);

        recalcularNivel(perfil);

        perfilEntrenamientoRepository.save(perfil);

        log.info(
                "XP otorgado a {}: +{} (total: {}, nivel: {})",
                usuario.getCorreo(),
                xpGanado,
                perfil.getXpTotal(),
                perfil.getNivel()
        );
    }

    @Override
    @Transactional
    public void evaluarYOtorgarInsignias(Usuario usuario) {
        PerfilEntrenamiento perfil = obtenerOCrearPerfil(usuario);

        List<Insignia> insigniasActuales =
                insigniaRepository.findByUsuario_CorreoOrderByFechaRegistroDesc(
                        usuario.getCorreo()
                );

        // --- Regla 1: Primera misión completada ---
        long totalCompletados = contarPathChallengesCompletados(usuario);

        otorgarSiNoExiste(
                usuario,
                insigniasActuales,
                INSIGNIA_PRIMERA_MISION,
                "Completaste tu primera misión práctica",
                "🎯",
                "bg-purple-100",
                totalCompletados >= 1
        );

        // --- Regla 2: Racha de 3 misiones completadas ---
        otorgarSiNoExiste(
                usuario,
                insigniasActuales,
                INSIGNIA_RACHA_3,
                "Completaste 3 misiones prácticas",
                "🔥",
                "bg-orange-100",
                totalCompletados >= 3
        );

        // --- Regla 3: Nivel 5 alcanzado ---
        otorgarSiNoExiste(
                usuario,
                insigniasActuales,
                INSIGNIA_NIVEL_5,
                "Alcanzaste el nivel 5",
                "⭐",
                "bg-yellow-100",
                perfil.getNivel() >= 5
        );
    }

    // ---------------------------------------------------------------
    // Helpers privados
    // ---------------------------------------------------------------

    private PerfilEntrenamiento obtenerOCrearPerfil(Usuario usuario) {
        return perfilEntrenamientoRepository
                .findByUsuario_IdUsuario(usuario.getIdUsuario())
                .orElseGet(() -> {
                    PerfilEntrenamiento nuevo = new PerfilEntrenamiento();
                    nuevo.setUsuario(usuario);
                    nuevo.setXpTotal(0);
                    nuevo.setNivel(1);
                    nuevo.setXpSiguienteNivel(XP_BASE_POR_NIVEL);
                    nuevo.setExploracionIniciada(false);
                    return perfilEntrenamientoRepository.save(nuevo);
                });
    }

    /**
     * Recalcula nivel y xpSiguienteNivel según el xpTotal actual.
     * Fórmula: el umbral acumulado para pasar del nivel N al N+1 es
     * 1000 * N. Sube de nivel mientras el xpTotal alcance o supere
     * el umbral siguiente (soporta saltos de más de un nivel de una vez).
     */
    private void recalcularNivel(PerfilEntrenamiento perfil) {
        int nivel = perfil.getNivel();
        int xpTotal = perfil.getXpTotal();
        int umbralSiguiente = XP_BASE_POR_NIVEL * nivel;

        while (xpTotal >= umbralSiguiente) {
            nivel++;
            umbralSiguiente += XP_BASE_POR_NIVEL * nivel;
        }

        perfil.setNivel(nivel);
        perfil.setXpSiguienteNivel(umbralSiguiente);
    }

    private long contarPathChallengesCompletados(Usuario usuario) {
        return usuarioPathChallengeRepository
                .findByUsuario_IdUsuarioAndActivoTrue(usuario.getIdUsuario())
                .stream()
                .filter(avance -> "COMPLETADO".equalsIgnoreCase(avance.getEstado()))
                .count();
    }

    private void otorgarSiNoExiste(
            Usuario usuario,
            List<Insignia> insigniasActuales,
            String nombre,
            String descripcion,
            String emoji,
            String colorFondo,
            boolean condicionCumplida
    ) {
        if (!condicionCumplida) {
            return;
        }

        boolean yaExiste = insigniasActuales.stream()
                .anyMatch(insignia -> nombre.equals(insignia.getNombre()));

        if (yaExiste) {
            return;
        }

        Insignia nueva = new Insignia();
        nueva.setUsuario(usuario);
        nueva.setNombre(nombre);
        nueva.setDescripcion(descripcion);
        nueva.setEmoji(emoji);
        nueva.setColorFondo(colorFondo);
        nueva.setFechaObtenida(java.time.LocalDate.now().format(FORMATO_FECHA));

        insigniaRepository.save(nueva);

        log.info("Insignia otorgada a {}: {}", usuario.getCorreo(), nombre);
    }
}
