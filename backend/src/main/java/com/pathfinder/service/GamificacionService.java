package com.pathfinder.service;

import com.pathfinder.model.entity.Usuario;

/**
 * Servicio de gamificación del estudiante: maneja XP acumulado, nivel,
 * y otorgamiento de insignias según reglas fijas.
 *
 * Alcance: solo lado estudiante (HU-EST-32 / HU-EST-33).
 * No depende de nada del módulo admin.
 */
public interface GamificacionService {

    /**
     * Suma XP al perfil de entrenamiento del usuario y recalcula su nivel
     * si corresponde. Crea el perfil si el usuario todavía no tiene uno.
     *
     * @param usuario usuario al que se le otorga el XP
     * @param xpGanado cantidad de XP a sumar (debe ser positiva)
     */
    void sumarXp(Usuario usuario, Integer xpGanado);

    /**
     * Revisa las reglas fijas de insignias y otorga (crea en BD) las que el
     * usuario haya alcanzado y todavía no tenga. Es idempotente: si una
     * insignia ya fue otorgada antes, no la duplica.
     *
     * @param usuario usuario a evaluar
     */
    void evaluarYOtorgarInsignias(Usuario usuario);
}
