package com.pathfinder.service.impl;

import com.pathfinder.model.entity.Usuario;
import com.pathfinder.model.enums.RolUsuario;
import com.pathfinder.repository.UsuarioRepository;
import com.pathfinder.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UsuarioRepository usuarioRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<Usuario> findByCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }

    @Override
    public Usuario getCurrentUser(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + correo));
    }

    @Override
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @Override
    @Transactional
    public Usuario actualizarRolUsuario(Integer idUsuario, RolUsuario nuevoRol, String correoAdminActual) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + idUsuario));

        if (usuario.getCorreo().equalsIgnoreCase(correoAdminActual)
                && nuevoRol != RolUsuario.ADMIN) {
            throw new IllegalStateException("No puedes quitarte tu propio rol de administrador");
        }

        usuario.setRol(nuevoRol);
        usuario.setFechaModificacion(LocalDateTime.now());

        return usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public void reiniciarEstudiante(Integer idUsuario, String correoAdminActual) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + idUsuario));

        if (usuario.getRol() != RolUsuario.USER) {
            throw new IllegalStateException("Solo se puede reiniciar a usuarios con rol de Estudiante (USER)");
        }

        // 1. Respuestas de encuestas de satisfacción
        entityManager.createQuery("DELETE FROM SatisfactionAnswer sa WHERE sa.submission.student.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();
        entityManager.createQuery("DELETE FROM SatisfactionSubmission ss WHERE ss.student.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();

        // 2. Entrevistas y sus detalles
        entityManager.createQuery("DELETE FROM EntrevistaCompetencia ec WHERE ec.entrevista.estudiante.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();
        entityManager.createQuery("DELETE FROM RespuestaEncuesta re WHERE re.estudiante.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();
        entityManager.createQuery("DELETE FROM Entrevista e WHERE e.estudiante.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();

        // 3. Perfil CV y detalles
        List<Integer> perfilIds = entityManager.createQuery(
                "SELECT p.idPerfilCv FROM PerfilCV p WHERE p.usuario.idUsuario = :id", Integer.class)
                .setParameter("id", idUsuario).getResultList();
        
        if (!perfilIds.isEmpty()) {
            entityManager.createQuery("DELETE FROM PerfilCVIdioma p WHERE p.perfilCv.idPerfilCv IN :ids")
                    .setParameter("ids", perfilIds).executeUpdate();
            entityManager.createQuery("DELETE FROM PerfilCVHerramienta p WHERE p.perfilCv.idPerfilCv IN :ids")
                    .setParameter("ids", perfilIds).executeUpdate();
            entityManager.createQuery("DELETE FROM PerfilCVHabilidad p WHERE p.perfilCv.idPerfilCv IN :ids")
                    .setParameter("ids", perfilIds).executeUpdate();
            entityManager.createQuery("DELETE FROM FormacionAcademica p WHERE p.perfilCv.idPerfilCv IN :ids")
                    .setParameter("ids", perfilIds).executeUpdate();
            entityManager.createQuery("DELETE FROM ExperienciaLaboral p WHERE p.perfilCv.idPerfilCv IN :ids")
                    .setParameter("ids", perfilIds).executeUpdate();
            entityManager.createQuery("DELETE FROM ArchivoCV p WHERE p.perfilCv.idPerfilCv IN :ids")
                    .setParameter("ids", perfilIds).executeUpdate();
            entityManager.createQuery("DELETE FROM PerfilCV p WHERE p.idPerfilCv IN :ids")
                    .setParameter("ids", perfilIds).executeUpdate();
        }

        // 4. Diagnóstico inicial y respuestas
        entityManager.createQuery("DELETE FROM RespuestaDiagnostico rd WHERE rd.diagnostico.usuario.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();
        entityManager.createQuery("DELETE FROM DiagnosticoInicial di WHERE di.usuario.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();

        // 5. Test DISC
        entityManager.createQuery("DELETE FROM RespuestaPreguntaDISC rp WHERE rp.usuario.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();
        entityManager.createQuery("DELETE FROM ResultadoDISC r WHERE r.usuario.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();

        // 6. SkillPaths y evidencias
        entityManager.createQuery("DELETE FROM EvidenciaSkillPath esp WHERE esp.usuarioSkillPath.usuario.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();
        entityManager.createQuery("DELETE FROM UsuarioSkillPath usp WHERE usp.usuario.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();

        // 7. PathChallenges y tareas
        entityManager.createQuery("DELETE FROM UsuarioPathChallengeTask upct WHERE upct.usuarioPathChallenge.usuario.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();
        entityManager.createQuery("DELETE FROM UsuarioPathChallenge upc WHERE upc.usuario.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();

        // 8. Registros varios del estudiante
        entityManager.createQuery("DELETE FROM ProgresoEstudiante pe WHERE pe.usuario.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();
        entityManager.createQuery("DELETE FROM VisitaSubArea vsa WHERE vsa.usuario.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();
        entityManager.createQuery("DELETE FROM Notificacion n WHERE n.usuario.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();
        entityManager.createQuery("DELETE FROM PerfilEntrenamiento pe WHERE pe.usuario.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();
        entityManager.createQuery("DELETE FROM SesionAutenticacion sa WHERE sa.usuario.idUsuario = :id")
                .setParameter("id", idUsuario).executeUpdate();

        // 9. Actualizar usuario a estado inicial
        usuario.setNuevoUsuario(true);
        usuario.setFechaModificacion(LocalDateTime.now());
        usuarioRepository.save(usuario);
    }
}
