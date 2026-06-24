package com.pathfinder.service.impl;

import com.pathfinder.dto.request.MentorProfileRequest;
import com.pathfinder.dto.response.MentorProfileResponse;
import com.pathfinder.model.entity.*;
import com.pathfinder.model.enums.RolUsuario;
import com.pathfinder.repository.*;
import com.pathfinder.service.MentorProfileService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MentorProfileServiceImpl implements MentorProfileService {

    private final UsuarioRepository usuarioRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final MentorAreaExpertiseRepository mentorAreaExpertiseRepository;
    private final MentorCertificacionRepository mentorCertificacionRepository;
    private final MentorEspecialidadRepository mentorEspecialidadRepository;
    private final EntrevistaRepository entrevistaRepository;

    @Override
    public MentorProfileResponse obtenerPerfil(String correo) {
        Usuario usuario = obtenerUsuario(correo);

        Optional<MentorProfile> profileOpt = mentorProfileRepository.findByMentor_Correo(correo);

        MentorProfileResponse.MentorProfileResponseBuilder builder = MentorProfileResponse.builder()
                .idUsuario(usuario.getIdUsuario())
                .nombreCompleto(usuario.getNombreCompleto())
                .correo(usuario.getCorreo())
                .avatarUrl(usuario.getAvatarUrl())
                .areasExpertise(Collections.emptyList())
                .certificaciones(Collections.emptyList())
                .especialidades(Collections.emptyList());

        profileOpt.ifPresent(profile -> {
            builder
                .titulo(profile.getTitulo())
                .telefono(profile.getTelefono())
                .ubicacion(profile.getUbicacion())
                .linkedinUrl(profile.getLinkedinUrl())
                .bio(profile.getBio())
                .areasExpertise(mapAreasExpertise(profile.getAreasExpertise()))
                .certificaciones(mapCertificaciones(profile.getCertificaciones()))
                .especialidades(mapEspecialidades(profile.getEspecialidades()));
        });

        builder.metrics(calcularMetricas(correo, profileOpt.orElse(null)));

        return builder.build();
    }

    @Override
    @Transactional
    public MentorProfileResponse guardarPerfil(String correo, MentorProfileRequest request) {
        Usuario usuario = obtenerUsuario(correo);

        MentorProfile profile = mentorProfileRepository.findByMentor_Correo(correo)
                .orElseGet(() -> {
                    MentorProfile nuevo = new MentorProfile();
                    nuevo.setMentor(usuario);
                    return nuevo;
                });

        profile.setTitulo(request.getTitulo());
        profile.setTelefono(request.getTelefono());
        profile.setUbicacion(request.getUbicacion());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setBio(request.getBio());

        profile = mentorProfileRepository.save(profile);

        persistirAreasExpertise(profile, request.getAreasExpertise());
        persistirCertificaciones(profile, request.getCertificaciones());
        persistirEspecialidades(profile, request.getEspecialidades());

        return obtenerPerfil(correo);
    }

    private void persistirCertificaciones(MentorProfile profile,
            List<MentorProfileRequest.CertificacionRequest> lista) {
        profile.getCertificaciones().clear();
        if (lista == null || lista.isEmpty()) return;

        for (var r : lista) {
            MentorCertificacion c = new MentorCertificacion();
            c.setMentorProfile(profile);
            c.setTitulo(r.getTitulo());
            c.setEmisor(r.getEmisor());
            c.setAnio(r.getAnio());
            profile.getCertificaciones().add(c);
        }
    }

    private void persistirAreasExpertise(MentorProfile profile,
            List<MentorProfileRequest.AreaExpertiseRequest> lista) {
        profile.getAreasExpertise().clear();
        if (lista == null || lista.isEmpty()) return;

        for (var r : lista) {
            MentorAreaExpertise a = new MentorAreaExpertise();
            a.setMentorProfile(profile);
            a.setNombre(r.getNombre());
            a.setAniosExperiencia(r.getAniosExperiencia());
            profile.getAreasExpertise().add(a);
        }
    }

    private void persistirEspecialidades(MentorProfile profile,
            List<MentorProfileRequest.EspecialidadRequest> lista) {
        profile.getEspecialidades().clear();
        if (lista == null || lista.isEmpty()) return;

        for (var r : lista) {
            MentorEspecialidad e = new MentorEspecialidad();
            e.setMentorProfile(profile);
            e.setNombre(r.getNombre());
            profile.getEspecialidades().add(e);
        }
    }

    private MentorProfileResponse.MentorMetrics calcularMetricas(String correo, MentorProfile profile) {
        List<Entrevista> entrevistas = entrevistaRepository.findByMentor_Correo(correo);

        long total = entrevistas.size();
        long aprobadas = entrevistas.stream()
                .filter(e -> "Completada".equalsIgnoreCase(e.getEstado())
                        && ("Aprobado".equalsIgnoreCase(e.getResultado()) 
                            || "Alta".equalsIgnoreCase(e.getResultado()) 
                            || "Media".equalsIgnoreCase(e.getResultado())))
                .count();
        double tasa = total > 0 ? Math.round((double) aprobadas / total * 10000.0) / 100.0 : 0.0;

        double sumaCalificaciones = entrevistas.stream()
                .filter(e -> e.getCompetenciaComunicacion() != null
                        && e.getCompetenciaTecnica() != null
                        && e.getCompetenciaProactividad() != null
                        && e.getCompetenciaResolucion() != null)
                .mapToDouble(e -> {
                    double prom = (e.getCompetenciaComunicacion()
                            + e.getCompetenciaTecnica()
                            + e.getCompetenciaProactividad()
                            + e.getCompetenciaResolucion()) / 4.0;
                    return Math.round(prom * 10.0) / 10.0;
                })
                .sum();
        long conFeedback = entrevistas.stream()
                .filter(e -> e.getCompetenciaComunicacion() != null).count();
        double promedio = conFeedback > 0 ? Math.round(sumaCalificaciones / conFeedback * 10.0) / 10.0 : 0.0;

        int totalAnios = 0;
        if (profile != null && profile.getAreasExpertise() != null) {
            totalAnios = profile.getAreasExpertise().stream()
                    .mapToInt(a -> a.getAniosExperiencia() != null ? a.getAniosExperiencia() : 0)
                    .sum();
        }

        return MentorProfileResponse.MentorMetrics.builder()
                .totalEntrevistas(total)
                .tasaAprobacion(tasa)
                .calificacionPromedio(promedio)
                .aniosExperiencia(totalAnios)
                .build();
    }

    private List<MentorProfileResponse.CertificacionItem> mapCertificaciones(
            List<MentorCertificacion> lista) {
        if (lista == null) return Collections.emptyList();
        return lista.stream().map(c ->
                MentorProfileResponse.CertificacionItem.builder()
                        .id(c.getIdCertificacion())
                        .titulo(c.getTitulo())
                        .emisor(c.getEmisor())
                        .anio(c.getAnio())
                        .build()
        ).collect(Collectors.toList());
    }

    private List<MentorProfileResponse.AreaExpertiseItem> mapAreasExpertise(
            List<MentorAreaExpertise> lista) {
        if (lista == null) return Collections.emptyList();
        return lista.stream().map(a ->
                MentorProfileResponse.AreaExpertiseItem.builder()
                        .id(a.getIdAreaExpertise())
                        .nombre(a.getNombre())
                        .aniosExperiencia(a.getAniosExperiencia())
                        .build()
        ).collect(Collectors.toList());
    }

    private List<String> mapEspecialidades(List<MentorEspecialidad> lista) {
        if (lista == null) return Collections.emptyList();
        return lista.stream()
                .map(MentorEspecialidad::getNombre)
                .collect(Collectors.toList());
    }

    private Usuario obtenerUsuario(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuario no encontrado: " + correo));
    }
}
