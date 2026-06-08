package com.pathfinder.service.impl;

import com.pathfinder.dto.request.GuardarPerfilRequest;
import com.pathfinder.dto.response.EstadoEstudianteResponse;
import com.pathfinder.dto.response.PerfilEstudianteResponse;
import com.pathfinder.model.entity.*;
import com.pathfinder.model.enums.*;
import com.pathfinder.repository.*;
import com.pathfinder.service.PerfilEstudianteService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PerfilEstudianteServiceImpl implements PerfilEstudianteService {

    private final UsuarioRepository             usuarioRepository;
    private final PerfilCVRepository            perfilCVRepository;
    private final ExperienciaLaboralRepository  experienciaRepo;
    private final FormacionAcademicaRepository  formacionRepo;
    private final HabilidadRepository           habilidadRepo;
    private final IdiomaRepository              idiomaRepo;
    private final HerramientaDigitalRepository  herramientaRepo;
    private final PerfilCVHabilidadRepository   perfilHabilidadRepo;
    private final PerfilCVIdiomaRepository      perfilIdiomaRepo;
    private final PerfilCVHerramientaRepository perfilHerramientaRepo;
    private final ProgresoEstudianteRepository  progresoRepo;
    private final ArchivoCVRepository           archivoCVRepository;

    // =========================================================
    // HU-EST-03 — Estado del estudiante
    // =========================================================

    @Override
    public EstadoEstudianteResponse obtenerEstado(String correo) {
        Usuario usuario = obtenerUsuario(correo);
        boolean tienePerfilCV = perfilCVRepository.existsByUsuario_Correo(correo);

        List<ProgresoEstudiante> progresos =
                progresoRepo.findByUsuario_IdUsuario(usuario.getIdUsuario());

        Map<NombreEtapa, EstadoEtapa> etapas = new EnumMap<>(NombreEtapa.class);
        for (NombreEtapa e : NombreEtapa.values()) {
            etapas.put(e, EstadoEtapa.PENDIENTE);
        }
        progresos.forEach(p -> etapas.put(p.getNombreEtapa(), p.getEstadoEtapa()));

        NombreEtapa etapaActual = resolverEtapaActual(etapas);
        boolean confirmado =
                etapas.get(NombreEtapa.CONFIRMACION_PERFIL) == EstadoEtapa.COMPLETADA;

        return EstadoEstudianteResponse.builder()
                .tienePerfilCV(tienePerfilCV)
                .perfilConfirmado(confirmado)
                .etapas(etapas)
                .etapaActual(etapaActual)
                .build();
    }

    // =========================================================
    // HU-EST-08 — Obtener perfil para revisión
    // =========================================================

    @Override
    public PerfilEstudianteResponse obtenerPerfil(String correo) {
        Usuario usuario = obtenerUsuario(correo);
        Optional<PerfilCV> perfilOpt = perfilCVRepository.findByUsuario_Correo(correo);

        EstadoEtapa estadoPerfil = progresoRepo
                .findByUsuario_IdUsuarioAndNombreEtapa(
                        usuario.getIdUsuario(), NombreEtapa.CONFIRMACION_PERFIL)
                .map(ProgresoEstudiante::getEstadoEtapa)
                .orElse(EstadoEtapa.PENDIENTE);

        PerfilEstudianteResponse.PerfilEstudianteResponseBuilder builder =
                PerfilEstudianteResponse.builder()
                        .idUsuario(usuario.getIdUsuario())
                        .nombreCompleto(usuario.getNombreCompleto())
                        .correo(usuario.getCorreo())
                        .avatarUrl(usuario.getAvatarUrl())
                        .estadoPerfil(estadoPerfil)
                        .confirmado(estadoPerfil == EstadoEtapa.COMPLETADA)
                        .experiencias(Collections.emptyList())
                        .formaciones(Collections.emptyList())
                        .habilidades(Collections.emptyList())
                        .idiomas(Collections.emptyList())
                        .herramientas(Collections.emptyList());

        perfilOpt.ifPresent(perfil -> {
            Optional<ArchivoCV> archivoOpt = archivoCVRepository
                    .findTopByPerfilCv_IdPerfilCvAndActivoTrueOrderByFechaCargaDesc(perfil.getIdPerfilCv());
            
            builder
                .correoContacto(perfil.getCorreoContacto())
                .celular(perfil.getCelular())
                .provincia(perfil.getProvincia())
                .distrito(perfil.getDistrito())
                .linkedinUrl(perfil.getLinkedinUrl())
                .perfilProfesional(perfil.getPerfilProfesional())
                .interesesProfesionales(perfil.getInteresesProfesionales())
                .objetivosLaborales(perfil.getObjetivosLaborales())
                .fechaActualizacionCv(perfil.getFechaActualizacionCv())
                .cvNombreArchivo(archivoOpt.map(ArchivoCV::getNombreArchivo).orElse(null))
                .cvUploaded(archivoOpt.isPresent())
                .experiencias(mapExperiencias(
                        experienciaRepo.findByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv())))
                .formaciones(mapFormaciones(
                        formacionRepo.findByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv())))
                .habilidades(mapHabilidades(
                        perfilHabilidadRepo.findByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv())))
                .idiomas(mapIdiomas(
                        perfilIdiomaRepo.findByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv())))
                .herramientas(mapHerramientas(
                        perfilHerramientaRepo.findByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv())));
        });

        return builder.build();
    }

    // =========================================================
    // HU-EST-05 / 06 / 07 / 08 — Guardar perfil
    // =========================================================

    @Override
    @Transactional
    public PerfilEstudianteResponse guardarPerfil(String correo, GuardarPerfilRequest req) {
        Usuario usuario = obtenerUsuario(correo);

        PerfilCV perfil = perfilCVRepository.findByUsuario_Correo(correo)
                .orElseGet(() -> {
                    PerfilCV nuevo = new PerfilCV();
                    nuevo.setUsuario(usuario);
                    return nuevo;
                });

        perfil.setCorreoContacto(req.getCorreoContacto());
        perfil.setCelular(req.getCelular());
        perfil.setProvincia(req.getProvincia());
        perfil.setDistrito(req.getDistrito());
        perfil.setLinkedinUrl(req.getLinkedinUrl());
        perfil.setPerfilProfesional(req.getPerfilProfesional());
        perfil.setInteresesProfesionales(req.getInteresesProfesionales());
        perfil.setObjetivosLaborales(req.getObjetivosLaborales());
        perfil.setFechaActualizacionCv(LocalDateTime.now());

        perfil = perfilCVRepository.save(perfil);

        if (StringUtils.hasText(req.getNombreCompleto())) {
            usuario.setNombreCompleto(req.getNombreCompleto().trim());
            usuario.setFechaModificacion(LocalDateTime.now());
            usuarioRepository.save(usuario);
        }

        persistirExperiencias(perfil, req.getExperiencias());
        persistirFormaciones(perfil, req.getFormaciones());
        persistirHabilidades(perfil, req.getHabilidades());
        persistirIdiomas(perfil, req.getIdiomas());
        persistirHerramientas(perfil, req.getHerramientas());

        // Avanzar etapas (nunca retrocede una ya completada)
        actualizarProgreso(usuario, NombreEtapa.CARGA_CV,        EstadoEtapa.EN_PROGRESO, false);
        actualizarProgreso(usuario, NombreEtapa.REVISION_PERFIL, EstadoEtapa.EN_PROGRESO, false);

        return obtenerPerfil(correo);
    }

    // =========================================================
    // HU-EST-09 — Confirmar perfil
    // =========================================================

    @Override
    @Transactional
    public EstadoEstudianteResponse confirmarPerfil(String correo) {
        Usuario usuario = obtenerUsuario(correo);

        PerfilCV perfil = perfilCVRepository.findByUsuario_Correo(correo)
                .orElseThrow(() -> new IllegalStateException(
                        "Debe completar su perfil antes de confirmarlo"));

        validarCamposMinimos(perfil, usuario);

        actualizarProgreso(usuario, NombreEtapa.CARGA_CV,            EstadoEtapa.COMPLETADA, true);
        actualizarProgreso(usuario, NombreEtapa.REVISION_PERFIL,     EstadoEtapa.COMPLETADA, true);
        actualizarProgreso(usuario, NombreEtapa.CONFIRMACION_PERFIL, EstadoEtapa.COMPLETADA, true);

        return obtenerEstado(correo);
    }

    // =========================================================
    // Helpers — persistencia por sección
    // =========================================================

    private void persistirExperiencias(PerfilCV perfil,
            List<GuardarPerfilRequest.ExperienciaRequest> lista) {
        experienciaRepo.deleteByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv());
        if (lista == null || lista.isEmpty()) return;

        for (var r : lista) {
            ExperienciaLaboral e = new ExperienciaLaboral();
            e.setPerfilCv(perfil);
            e.setEmpresa(r.getEmpresa());
            e.setCargo(r.getCargo());
            e.setFuncionesRealizadas(r.getFuncionesRealizadas());
            e.setLogrosResultados(r.getLogrosResultados());
            if (StringUtils.hasText(r.getFechaInicio()))
                e.setFechaInicio(LocalDate.parse(r.getFechaInicio()));
            // Solo setear fechaFin si no está trabajando actualmente
            if (!Boolean.TRUE.equals(r.getTrabajoActual())
                    && StringUtils.hasText(r.getFechaFin()))
                e.setFechaFin(LocalDate.parse(r.getFechaFin()));
            experienciaRepo.save(e);
        }
    }

    private void persistirFormaciones(PerfilCV perfil,
            List<GuardarPerfilRequest.FormacionRequest> lista) {
        formacionRepo.deleteByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv());
        if (lista == null || lista.isEmpty()) return;

        for (var r : lista) {
            FormacionAcademica f = new FormacionAcademica();
            f.setPerfilCv(perfil);
            f.setInstitucion(r.getInstitucion());
            f.setCarrera(r.getCarrera());
            f.setCursosRelevantes(r.getCursosRelevantes());
            if (StringUtils.hasText(r.getFechaInicio()))
                f.setFechaInicio(LocalDate.parse(r.getFechaInicio()));
            // Solo setear fechaFin si no está en curso
            if (!Boolean.TRUE.equals(r.getEnCurso())
                    && StringUtils.hasText(r.getFechaFin()))
                f.setFechaFin(LocalDate.parse(r.getFechaFin()));
            formacionRepo.save(f);
        }
    }

    private void persistirHabilidades(PerfilCV perfil,
            List<GuardarPerfilRequest.HabilidadRequest> lista) {
        perfilHabilidadRepo.deleteByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv());
        if (lista == null || lista.isEmpty()) return;

        for (var r : lista) {
            // Validar enum estrictamente — lanzar error claro si viene un valor inválido
            TipoHabilidad tipo = parseTipoHabilidadEstricto(r.getTipo());
            NivelDominio  nivel = parseNivelEstricto(r.getNivel(), "habilidad '" + r.getNombre() + "'");

            Habilidad h = habilidadRepo
                    .findByNombreHabilidadIgnoreCase(r.getNombre())
                    .orElseGet(() -> {
                        Habilidad nueva = new Habilidad();
                        nueva.setNombreHabilidad(r.getNombre());
                        nueva.setTipoHabilidad(tipo);
                        return habilidadRepo.save(nueva);
                    });

            PerfilCVHabilidad rel = new PerfilCVHabilidad();
            rel.setPerfilCv(perfil);
            rel.setHabilidad(h);
            rel.setNivel(nivel);
            perfilHabilidadRepo.save(rel);
        }
    }

    private void persistirIdiomas(PerfilCV perfil,
            List<GuardarPerfilRequest.IdiomaRequest> lista) {
        perfilIdiomaRepo.deleteByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv());
        if (lista == null || lista.isEmpty()) return;

        for (var r : lista) {
            NivelDominio nivel = parseNivelEstricto(r.getNivel(), "idioma '" + r.getNombre() + "'");

            Idioma idioma = idiomaRepo
                    .findByNombreIdiomaIgnoreCase(r.getNombre())
                    .orElseGet(() -> {
                        Idioma nuevo = new Idioma();
                        nuevo.setNombreIdioma(r.getNombre());
                        return idiomaRepo.save(nuevo);
                    });

            PerfilCVIdioma rel = new PerfilCVIdioma();
            rel.setPerfilCv(perfil);
            rel.setIdioma(idioma);
            rel.setNivel(nivel);
            perfilIdiomaRepo.save(rel);
        }
    }

    private void persistirHerramientas(PerfilCV perfil,
            List<GuardarPerfilRequest.HerramientaRequest> lista) {
        perfilHerramientaRepo.deleteByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv());
        if (lista == null || lista.isEmpty()) return;

        for (var r : lista) {
            NivelDominio nivel = parseNivelEstricto(r.getNivel(), "herramienta '" + r.getNombre() + "'");

            HerramientaDigital h = herramientaRepo
                    .findByNombreHerramientaIgnoreCase(r.getNombre())
                    .orElseGet(() -> {
                        HerramientaDigital nueva = new HerramientaDigital();
                        nueva.setNombreHerramienta(r.getNombre());
                        return herramientaRepo.save(nueva);
                    });

            PerfilCVHerramienta rel = new PerfilCVHerramienta();
            rel.setPerfilCv(perfil);
            rel.setHerramientaDigital(h);        // campo real en la entidad
            rel.setNivel(nivel);
            perfilHerramientaRepo.save(rel);
        }
    }

    // =========================================================
    // Helpers — progreso
    // =========================================================

    private void actualizarProgreso(Usuario usuario, NombreEtapa etapa,
                                    EstadoEtapa estado, boolean setFecha) {
        ProgresoEstudiante p = progresoRepo
                .findByUsuario_IdUsuarioAndNombreEtapa(usuario.getIdUsuario(), etapa)
                .orElseGet(() -> {
                    ProgresoEstudiante nuevo = new ProgresoEstudiante();
                    nuevo.setUsuario(usuario);
                    nuevo.setNombreEtapa(etapa);
                    return nuevo;
                });

        // No retroceder un estado ya COMPLETADO
        if (EstadoEtapa.COMPLETADA.equals(p.getEstadoEtapa())
                && estado != EstadoEtapa.COMPLETADA) return;

        p.setEstadoEtapa(estado);
        if (setFecha && estado == EstadoEtapa.COMPLETADA)
            p.setFechaCompletada(LocalDateTime.now());
        progresoRepo.save(p);
    }

    private NombreEtapa resolverEtapaActual(Map<NombreEtapa, EstadoEtapa> etapas) {
        for (NombreEtapa e : NombreEtapa.values()) {
            if (etapas.get(e) != EstadoEtapa.COMPLETADA) return e;
        }
        return NombreEtapa.CONFIRMACION_PERFIL;
    }

    private void validarCamposMinimos(PerfilCV perfil, Usuario usuario) {
        List<String> faltantes = new ArrayList<>();

        if (!StringUtils.hasText(usuario.getNombreCompleto()))
            faltantes.add("nombre completo");
        if (!StringUtils.hasText(perfil.getCorreoContacto()))
            faltantes.add("correo de contacto");

        boolean tieneExp = !experienciaRepo
                .findByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv()).isEmpty();
        boolean tieneForm = !formacionRepo
                .findByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv()).isEmpty();
        if (!tieneExp && !tieneForm)
            faltantes.add("al menos una experiencia laboral o formación académica");

        if (!faltantes.isEmpty())
            throw new IllegalStateException(
                    "Faltan campos para confirmar el perfil: "
                    + String.join(", ", faltantes));
    }

    // =========================================================
    // Helpers — mapeo a response  (usando nombres reales de entidades)
    // =========================================================

    private List<PerfilEstudianteResponse.ExperienciaItem> mapExperiencias(
            List<ExperienciaLaboral> lista) {
        return lista.stream().map(e ->
                PerfilEstudianteResponse.ExperienciaItem.builder()
                        .id(e.getIdExperiencia())                // nombre real del campo @Id
                        .empresa(e.getEmpresa())
                        .cargo(e.getCargo())
                        .funcionesRealizadas(e.getFuncionesRealizadas())
                        .logrosResultados(e.getLogrosResultados())
                        .fechaInicio(e.getFechaInicio() != null
                                ? e.getFechaInicio().toString() : null)
                        .fechaFin(e.getFechaFin() != null
                                ? e.getFechaFin().toString() : null)
                        .build()
        ).collect(Collectors.toList());
    }

    private List<PerfilEstudianteResponse.FormacionItem> mapFormaciones(
            List<FormacionAcademica> lista) {
        return lista.stream().map(f ->
                PerfilEstudianteResponse.FormacionItem.builder()
                        .id(f.getIdFormacion())                  // nombre real del campo @Id
                        .institucion(f.getInstitucion())
                        .carrera(f.getCarrera())
                        .cursosRelevantes(f.getCursosRelevantes())
                        .fechaInicio(f.getFechaInicio() != null
                                ? f.getFechaInicio().toString() : null)
                        .fechaFin(f.getFechaFin() != null
                                ? f.getFechaFin().toString() : null)
                        .build()
        ).collect(Collectors.toList());
    }

    private List<PerfilEstudianteResponse.HabilidadItem> mapHabilidades(
            List<PerfilCVHabilidad> lista) {
        return lista.stream().map(r ->
                PerfilEstudianteResponse.HabilidadItem.builder()
                        .id(r.getIdPerfilCvHabilidad())
                        .nombre(r.getHabilidad().getNombreHabilidad()) // nombre real
                        .tipo(r.getHabilidad().getTipoHabilidad() != null
                                ? r.getHabilidad().getTipoHabilidad().name() : null)
                        .nivel(r.getNivel() != null ? r.getNivel().name() : null)
                        .build()
        ).collect(Collectors.toList());
    }

    private List<PerfilEstudianteResponse.IdiomaItem> mapIdiomas(
            List<PerfilCVIdioma> lista) {
        return lista.stream().map(r ->
                PerfilEstudianteResponse.IdiomaItem.builder()
                        .id(r.getIdPerfilCvIdioma())
                        .nombre(r.getIdioma().getNombreIdioma())       // nombre real
                        .nivel(r.getNivel() != null ? r.getNivel().name() : null)
                        .build()
        ).collect(Collectors.toList());
    }

    private List<PerfilEstudianteResponse.HerramientaItem> mapHerramientas(
            List<PerfilCVHerramienta> lista) {
        return lista.stream().map(r ->
                PerfilEstudianteResponse.HerramientaItem.builder()
                        .id(r.getIdPerfilCvHerramienta())
                        .nombre(r.getHerramientaDigital().getNombreHerramienta()) // nombre real
                        .nivel(r.getNivel() != null ? r.getNivel().name() : null)
                        .build()
        ).collect(Collectors.toList());
    }

    // =========================================================
    // Helpers — parseo de enums (estricto, sin fallback silencioso)
    // =========================================================

    private TipoHabilidad parseTipoHabilidadEstricto(String tipo) {
        try {
            return TipoHabilidad.valueOf(tipo.trim().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "Tipo de habilidad inválido: '" + tipo
                    + "'. Valores aceptados: TECNICA, BLANDA");
        }
    }

    private NivelDominio parseNivelEstricto(String nivel, String contexto) {
        try {
            return NivelDominio.valueOf(nivel.trim().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "Nivel inválido en " + contexto + ": '" + nivel
                    + "'. Valores aceptados: BASICO, INTERMEDIO, AVANZADO");
        }
    }

    @Override
    @jakarta.transaction.Transactional
    public void actualizarProgresoEstudiante(String correo, NombreEtapa etapa, EstadoEtapa estado, boolean setFecha) {
        Usuario usuario = obtenerUsuario(correo);
        actualizarProgreso(usuario, etapa, estado, setFecha);
    }

    private Usuario obtenerUsuario(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuario no encontrado: " + correo));
    }
}
