package com.pathfinder.controller;

import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.dto.response.InsigniaDTO;
import com.pathfinder.dto.response.MiProgresoResponseDTO;
import com.pathfinder.model.entity.Insignia;
import com.pathfinder.model.entity.PerfilEntrenamiento;
import com.pathfinder.model.entity.Usuario;
import com.pathfinder.repository.InsigniaRepository;
import com.pathfinder.repository.PerfilEntrenamientoRepository;
import com.pathfinder.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * HU-EST-33: "Mi Progreso" — vista consolidada de nivel, XP total
 * y vitrina de insignias del estudiante.
 *
 * Solo lectura, solo lado estudiante. No depende de nada del módulo admin.
 */
@Slf4j
@RestController
@RequestMapping("/api/mi-progreso")
@RequiredArgsConstructor
public class MiProgresoController {

    private static final int XP_BASE_POR_NIVEL = 1000;

    private final UsuarioRepository usuarioRepository;
    private final PerfilEntrenamientoRepository perfilEntrenamientoRepository;
    private final InsigniaRepository insigniaRepository;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('USER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<MiProgresoResponseDTO>> obtenerMiProgreso(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            String correo = userDetails.getUsername();

            Usuario usuario = usuarioRepository.findByCorreo(correo)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + correo));

            PerfilEntrenamiento perfil = perfilEntrenamientoRepository
                    .findByUsuario_Correo(correo)
                    .orElseGet(() -> crearPerfilInicial(usuario));

            List<Insignia> insignias = insigniaRepository
                    .findByUsuario_CorreoOrderByFechaRegistroDesc(correo);

            List<InsigniaDTO> insigniasDTO = insignias.stream()
                    .map(ins -> InsigniaDTO.builder()
                            .idInsignia(ins.getIdInsignia())
                            .nombre(ins.getNombre())
                            .descripcion(ins.getDescripcion())
                            .emoji(ins.getEmoji())
                            .colorFondo(ins.getColorFondo())
                            .fechaObtenida(ins.getFechaObtenida())
                            .build())
                    .toList();

            boolean esNuevo = perfil.getXpTotal() == 0 && insigniasDTO.isEmpty();

            int xpFaltante = Math.max(
                    0,
                    perfil.getXpSiguienteNivel() - perfil.getXpTotal()
            );

            MiProgresoResponseDTO response = MiProgresoResponseDTO.builder()
                    .xpTotal(perfil.getXpTotal())
                    .nivel(perfil.getNivel())
                    .xpSiguienteNivel(perfil.getXpSiguienteNivel())
                    .xpFaltanteSiguienteNivel(xpFaltante)
                    .esNuevo(esNuevo)
                    .insignias(insigniasDTO)
                    .build();

            return ResponseEntity.ok(
                    ApiResponse.success("Progreso del estudiante obtenido", response)
            );
        } catch (Exception e) {
            log.error("Error obteniendo Mi Progreso: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener el progreso del estudiante"));
        }
    }

    // Misma lógica de creación inicial que ya usa DashboardServiceImpl,
    // duplicada aquí a propósito para no acoplar este controller a otro
    // service y mantener el cambio acotado solo a archivos nuevos.
    private PerfilEntrenamiento crearPerfilInicial(Usuario usuario) {
        PerfilEntrenamiento nuevo = new PerfilEntrenamiento();
        nuevo.setUsuario(usuario);
        nuevo.setXpTotal(0);
        nuevo.setNivel(1);
        nuevo.setXpSiguienteNivel(XP_BASE_POR_NIVEL);
        nuevo.setExploracionIniciada(false);
        return perfilEntrenamientoRepository.save(nuevo);
    }
}
