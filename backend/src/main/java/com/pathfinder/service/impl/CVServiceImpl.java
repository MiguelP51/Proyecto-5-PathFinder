package com.pathfinder.service.impl;

import com.pathfinder.dto.cv.*;
import com.pathfinder.model.entity.*;
import com.pathfinder.model.enums.NivelDominio;
import com.pathfinder.model.enums.TipoHabilidad;
import com.pathfinder.repository.*;
import com.pathfinder.service.CVService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class CVServiceImpl implements CVService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilCVRepository perfilCVRepository;
    private final ExperienciaLaboralRepository experienciaRepo;
    private final FormacionAcademicaRepository formacionRepo;
    private final HabilidadRepository habilidadRepo;
    private final IdiomaRepository idiomaRepo;
    private final HerramientaDigitalRepository herramientaRepo;
    private final PerfilCVHabilidadRepository perfilHabilidadRepo;
    private final PerfilCVIdiomaRepository perfilIdiomaRepo;
    private final PerfilCVHerramientaRepository perfilHerramientaRepo;

    // =========================================================
    // DICCIONARIOS
    // =========================================================

    private static final List<String> HABILIDADES_TECNICAS = List.of(
            // Análisis y Datos
            "Análisis de Datos",
            "Business Intelligence",
            "SQL",
            "Python",
            "Estadística",
            // Gestión y Procesos
            "Gestión de Proyectos",
            "Gestión de Procesos",
            "Mejora Continua",
            "Lean Manufacturing",
            "Six Sigma",
            "Investigación de Operaciones",
            "Supply Chain",
            "Logística",
            "Planeamiento Estratégico",
            // Metodologías
            "Scrum",
            "Agile",
            "Design Thinking",
            "BPMN",
            // Negocios y Finanzas
            "Finanzas Corporativas",
            "Contabilidad",
            "Marketing Digital",
            "Gestión Comercial",
            "KPIs"
    );

    private static final List<String> HABILIDADES_BLANDAS = List.of(
            "Liderazgo",
            "Comunicación Efectiva",
            "Trabajo en Equipo",
            "Resolución de Problemas",
            "Pensamiento Analítico",
            "Pensamiento Estratégico",
            "Toma de Decisiones",
            "Orientación a Resultados",
            "Adaptabilidad",
            "Negociación",
            "Organización",
            "Proactividad",
            "Gestión del Tiempo"
    );

    private static final List<String> HERRAMIENTAS = List.of(
            // Ofimática y Análisis
            "Excel",
            "Power BI",
            "Tableau",
            "Minitab",
            "SPSS",
            // ERP / CRM
            "SAP",
            "Salesforce",
            "HubSpot",
            "Oracle ERP",
            // Gestión y Procesos
            "MS Project",
            "Bizagi",
            "Microsoft Visio",
            "AutoCAD",
            // Colaboración y Tareas
            "Jira",
            "Trello",
            "Asana",
            "Slack",
            "Notion",
            "Google Workspace"
    );

    private static final List<String> IDIOMAS = List.of(
            "Inglés",
            "English",
            "Español",
            "Portugués",
            "Francés",
            "Alemán"
    );

    private static final Map<String, List<String>> SECTION_ALIASES = Map.of(
            "perfil", List.of(
                    "perfil", "perfil profesional", "resumen", "sobre mi",
                    "acerca de mi", "profile", "summary", "objetivo profesional"
            ),
            "experiencia", List.of(
                    "experiencia", "experiencia laboral", "experiencia profesional",
                    "trayectoria laboral", "work experience", "experience", "prácticas"
            ),
            "educacion", List.of(
                    "educacion", "educación", "formacion academica", "formación académica",
                    "academic background", "estudios", "education", "universidad"
            ),
            "habilidades", List.of(
                    "habilidades", "competencias", "skills", "aptitudes", "fortalezas"
            ),
            "idiomas", List.of(
                    "idiomas", "languages"
            ),
            "herramientas", List.of(
                    "informatica", "informática", "software", "tools",
                    "herramientas", "tecnología", "conocimientos técnicos"
            ),
            // Nuevas secciones vitales para estudiantes
            "proyectos", List.of(
                    "proyectos", "proyectos académicos", "proyectos destacados", "projects"
            ),
            "certificaciones", List.of(
                    "certificaciones", "cursos", "diplomados", "certifications", "courses"
            ),
            "voluntariado", List.of(
                    "voluntariado", "actividades extracurriculares", "extracurricular", "logros"
            )
    );

    private static final Pattern PATRON_CORREO = Pattern.compile(
            "[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+"
    );

    private static final Pattern PATRON_TELEFONO = Pattern.compile(
            "(\\+?51[- ]?)?9\\d{2}[- ]?\\d{3}[- ]?\\d{3}"
    );

    private static final Pattern PATRON_LINKEDIN = Pattern.compile(
            "(https?:\\/\\/)?(www\\.)?linkedin\\.com\\/in\\/[A-Za-zA-Z0-9\\-_/]+",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern PATRON_RANGO_FECHAS = Pattern.compile(
            "(\\d{2})\\s*/\\s*(\\d{4})\\s*[-–]\\s*(Actualidad|Actual|Presente|(\\d{2})\\s*/\\s*(\\d{4}))?",
            Pattern.CASE_INSENSITIVE
    );

    // =========================================================
    // EXTRAER CV
    // =========================================================

    @Override
    public CVExtractadoDTO extraerCV(MultipartFile archivo) throws Exception {

        validarArchivo(archivo);

        String texto = extraerTextoPDF(archivo);

        texto = limpiarTexto(texto);

        log.info("======= TEXTO EXTRAIDO =======");
        log.info(texto);
        log.info("======= FIN TEXTO =======");

        return parsearCV(texto);
    }

    private void validarArchivo(MultipartFile archivo) {

        if (archivo == null || archivo.isEmpty()) {
            throw new RuntimeException("El archivo está vacío");
        }

        String nombre = archivo.getOriginalFilename();

        if (nombre == null ||
                !nombre.toLowerCase().endsWith(".pdf")) {

            throw new RuntimeException("Solo se permiten PDFs");
        }
    }

    private String extraerTextoPDF(MultipartFile archivo)
            throws IOException {

        try (var doc = Loader.loadPDF(archivo.getBytes())) {

            PDFTextStripper stripper =
                    new PDFTextStripper();

            stripper.setSortByPosition(true);

            return stripper.getText(doc);
        }
    }

    private String limpiarTexto(String texto) {

        return texto
                .replace("\r", "\n")
                .replace("\t", " ")
                .replace("\u00A0", " ")
                .replaceAll("[ ]{2,}", " ")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
    }

    // =========================================================
    // PARSEAR CV
    // =========================================================

    private CVExtractadoDTO parsearCV(String texto) {

        Map<String, String> secciones =
                extraerSecciones(texto);

        CVExtractadoDTO dto =
                new CVExtractadoDTO();

        dto.setNombreCompleto(
                extraerNombre(texto)
        );

        dto.setCorreoContacto(
                extraerCorreo(texto)
        );

        dto.setCelular(
                extraerTelefono(texto)
        );

        dto.setLinkedinUrl(
                extraerLinkedin(texto)
        );

        extraerUbicacion(texto, dto);

        dto.setPerfilProfesional(
                extraerPerfil(secciones)
        );

        dto.setExperiencias(
                extraerExperiencias(secciones)
        );

        dto.setFormaciones(
                extraerFormaciones(secciones)
        );

        dto.setHabilidades(
                eliminarDuplicadosHabilidades(
                        extraerHabilidades(secciones)
                )
        );

        dto.setHerramientas(
                extraerHerramientas(secciones)
        );

        dto.setIdiomas(
                extraerIdiomas(secciones)
        );

        return dto;
    }

    // =========================================================
    // SECCIONES
    // =========================================================

    private Map<String, String> extraerSecciones(
            String texto
    ) {

        Map<String, Integer> posiciones =
                new LinkedHashMap<>();

        String[] lineas = texto.split("\n");

        for (int i = 0; i < lineas.length; i++) {

            String linea =
                    normalizar(lineas[i]);

            for (var entry :
                    SECTION_ALIASES.entrySet()) {

                for (String alias :
                        entry.getValue()) {

                    if (linea.contains(alias)) {

                        posiciones.putIfAbsent(
                                entry.getKey(),
                                i
                        );
                    }
                }
            }
        }

        Map<String, String> secciones =
                new LinkedHashMap<>();

        if (posiciones.isEmpty()) {

            secciones.put(
                    "general",
                    texto
            );

            return secciones;
        }

        List<Map.Entry<String, Integer>> lista =
                new ArrayList<>(posiciones.entrySet());

        for (int i = 0; i < lista.size(); i++) {

            int inicio =
                    lista.get(i).getValue();

            int fin =
                    (i + 1 < lista.size())
                            ? lista.get(i + 1).getValue()
                            : lineas.length;

            String contenido =
                    String.join(
                            "\n",
                            Arrays.copyOfRange(
                                    lineas,
                                    inicio,
                                    fin
                            )
                    );

            secciones.put(
                    lista.get(i).getKey(),
                    contenido
            );
        }

        log.info("SECCIONES DETECTADAS: {}",
                secciones.keySet());

        return secciones;
    }

    private String normalizar(String texto) {

        if (texto == null) {
            return "";
        }

        texto = Normalizer.normalize(
                texto,
                Normalizer.Form.NFD
        );

        texto = texto.replaceAll(
                "\\p{InCombiningDiacriticalMarks}+",
                ""
        );

        return texto
                .toLowerCase()
                .replace("•", "")
                .replace("●", "")
                .replace("▪", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    // =========================================================
    // DATOS BÁSICOS
    // =========================================================

    private String extraerCorreo(String texto) {

        Matcher matcher =
                PATRON_CORREO.matcher(texto);

        return matcher.find()
                ? matcher.group()
                : null;
    }

    private String extraerTelefono(String texto) {

        Matcher matcher =
                PATRON_TELEFONO.matcher(texto);

        if (matcher.find()) {

            return matcher.group()
                    .replaceAll("[^0-9]", "");
        }

        return null;
    }

    private String extraerLinkedin(String texto) {

        Matcher matcher =
                PATRON_LINKEDIN.matcher(texto);

        return matcher.find()
                ? matcher.group()
                : null;
    }

    private String extraerNombre(String texto) {

        String[] lineas = texto.split("\n");

        List<String> prohibidas = List.of(
                "datos personales",
                "perfil",
                "perfil profesional",
                "experiencia",
                "experiencia laboral",
                "educacion",
                "educación",
                "habilidades",
                "idiomas",
                "contacto"
        );

        for (int i = 0;
             i < Math.min(15, lineas.length);
             i++) {

            String linea =
                    limpiarLinea(lineas[i]);

            if (linea.length() < 5 ||
                    linea.length() > 50) {
                continue;
            }

            String normalizada =
                    normalizar(linea);

            boolean prohibida =
                    prohibidas.stream()
                            .anyMatch(
                                    normalizada::contains
                            );

            if (prohibida) {
                continue;
            }

            if (linea.contains("@")) {
                continue;
            }

            if (linea.matches(
                    "^[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ]+(\\s+[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ]+){1,4}$"
            )) {

                return linea;
            }
        }

        return null;
    }

    private void extraerUbicacion(
            String texto,
            CVExtractadoDTO dto
    ) {

        Pattern pattern = Pattern.compile(
                "([A-Za-zÁÉÍÓÚÑáéíóúñ ]+),\\s*([A-Za-zÁÉÍÓÚÑáéíóúñ ]+),\\s*Perú",
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher =
                pattern.matcher(texto);

        if (matcher.find()) {

            dto.setDistrito(
                    matcher.group(1).trim()
            );

            dto.setProvincia(
                    matcher.group(2).trim()
            );
        }
    }

    private String extraerPerfil(
            Map<String, String> secciones
    ) {

        String perfil =
                secciones.get("perfil");

        if (perfil == null) {
            return null;
        }

        perfil = perfil
                .replaceFirst(
                        "(?i)perfil profesional",
                        ""
                )
                .replaceFirst(
                        "(?i)perfil",
                        ""
                )
                .trim();

        return perfil.length() > 1000
                ? perfil.substring(0, 1000)
                : perfil;
    }

    // =========================================================
    // EXPERIENCIAS
    // =========================================================

    private List<ExperienciaLaboralDTO>
    extraerExperiencias(
            Map<String, String> secciones
    ) {

        List<ExperienciaLaboralDTO> lista =
                new ArrayList<>();

        String experiencia =
                secciones.get("experiencia");

        if (experiencia == null) {
            return lista;
        }

        String[] bloques =
                experiencia.split("\\n\\s*\\n");

        for (String bloque : bloques) {

            Matcher matcher =
                    PATRON_RANGO_FECHAS.matcher(
                            bloque
                    );

            if (!matcher.find()) {
                continue;
            }

            String[] lineas =
                    bloque.split("\n");

            if (lineas.length < 2) {
                continue;
            }

            ExperienciaLaboralDTO dto =
                    new ExperienciaLaboralDTO();

            dto.setEmpresa(
                    limpiarLinea(lineas[0])
                            .replaceAll(
                                    "\\d{2}\\s*/\\s*\\d{4}.*",
                                    ""
                            )
                            .trim()
            );

            dto.setCargo(
                    limpiarLinea(lineas[1])
            );

            dto.setFuncionesRealizadas(
                    resumirBloque(bloque)
            );

            extraerFechasExperiencia(
                    bloque,
                    dto
            );

            lista.add(dto);
        }

        return lista;
    }

    private void extraerFechasExperiencia(
            String bloque,
            ExperienciaLaboralDTO dto
    ) {

        Matcher matcher =
                PATRON_RANGO_FECHAS.matcher(
                        bloque
                );

        if (!matcher.find()) {
            return;
        }

        int mesInicio =
                Integer.parseInt(
                        matcher.group(1)
                );

        int anioInicio =
                Integer.parseInt(
                        matcher.group(2)
                );

        dto.setFechaInicio(
                LocalDate.of(
                        anioInicio,
                        mesInicio,
                        1
                )
        );

        if (matcher.group(4) != null &&
                matcher.group(5) != null) {

            int mesFin =
                    Integer.parseInt(
                            matcher.group(4)
                    );

            int anioFin =
                    Integer.parseInt(
                            matcher.group(5)
                    );

            dto.setFechaFin(
                    LocalDate.of(
                            anioFin,
                            mesFin,
                            1
                    )
            );
        }
    }

    // =========================================================
    // FORMACIÓN
    // =========================================================

    private List<FormacionAcademicaDTO>
    extraerFormaciones(
            Map<String, String> secciones
    ) {

        List<FormacionAcademicaDTO> lista =
                new ArrayList<>();

        String educacion =
                secciones.get("educacion");

        if (educacion == null) {
            return lista;
        }

        String[] bloques =
                educacion.split("\\n\\s*\\n");

        for (String bloque : bloques) {

            FormacionAcademicaDTO dto =
                    new FormacionAcademicaDTO();

            dto.setInstitucion(
                    detectarUniversidad(bloque)
            );

            dto.setCarrera(
                    detectarCarrera(bloque)
            );

            lista.add(dto);
        }

        return lista;
    }

    // =========================================================
    // HABILIDADES
    // =========================================================

    private List<HabilidadDTO>
    extraerHabilidades(
            Map<String, String> secciones
    ) {

        List<HabilidadDTO> lista =
                new ArrayList<>();

        String texto = String.join(
                " ",
                secciones.values()
        ).toLowerCase();

        for (String habilidad :
                HABILIDADES_TECNICAS) {

            if (texto.contains(
                    habilidad.toLowerCase()
            )) {

                HabilidadDTO dto =
                        new HabilidadDTO();

                dto.setNombre(habilidad);
                dto.setTipo("TECNICA");
                dto.setNivel("INTERMEDIO");

                lista.add(dto);
            }
        }

        for (String habilidad :
                HABILIDADES_BLANDAS) {

            if (texto.contains(
                    habilidad.toLowerCase()
            )) {

                HabilidadDTO dto =
                        new HabilidadDTO();

                dto.setNombre(habilidad);
                dto.setTipo("BLANDA");
                dto.setNivel("INTERMEDIO");

                lista.add(dto);
            }
        }

        return lista;
    }

    private List<HabilidadDTO>
    eliminarDuplicadosHabilidades(
            List<HabilidadDTO> lista
    ) {

        Map<String, HabilidadDTO> map =
                new LinkedHashMap<>();

        for (HabilidadDTO dto : lista) {

            map.put(
                    dto.getNombre().toLowerCase(),
                    dto
            );
        }

        return new ArrayList<>(map.values());
    }

    // =========================================================
    // IDIOMAS
    // =========================================================

    private List<IdiomaDTO> extraerIdiomas(
            Map<String, String> secciones
    ) {

        List<IdiomaDTO> lista =
                new ArrayList<>();

        String texto =
                secciones.get("idiomas");

        if (texto == null) {
            return lista;
        }

        for (String idioma : IDIOMAS) {

            if (texto.toLowerCase().contains(
                    idioma.toLowerCase()
            )) {

                IdiomaDTO dto =
                        new IdiomaDTO();

                dto.setNombre(
                        capitalizar(idioma)
                );

                dto.setNivel(
                        detectarNivelIdioma(
                                texto,
                                idioma
                        )
                );

                lista.add(dto);
            }
        }

        return lista;
    }

    // =========================================================
    // HERRAMIENTAS
    // =========================================================

    private List<HerramientaDTO>
    extraerHerramientas(
            Map<String, String> secciones
    ) {

        List<HerramientaDTO> lista =
                new ArrayList<>();

        String texto =
                secciones.get("herramientas");

        if (texto == null) {
            return lista;
        }

        String lower =
                texto.toLowerCase();

        for (String herramienta :
                HERRAMIENTAS) {

            if (lower.contains(
                    herramienta.toLowerCase()
            )) {

                HerramientaDTO dto =
                        new HerramientaDTO();

                dto.setNombre(herramienta);

                dto.setNivel(
                        detectarNivel(
                                texto,
                                herramienta
                        )
                );

                lista.add(dto);
            }
        }

        return lista;
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private String detectarNivel(
            String texto,
            String keyword
    ) {

        String lower =
                texto.toLowerCase();

        String key =
                keyword.toLowerCase();

        if (lower.contains(key + " avanzado") ||
                lower.contains("avanzado " + key)) {

            return "AVANZADO";
        }

        if (lower.contains(key + " básico") ||
                lower.contains("básico " + key)) {

            return "BASICO";
        }

        return "INTERMEDIO";
    }

    private String detectarNivelIdioma(
            String texto,
            String idioma
    ) {

        String lower =
                texto.toLowerCase();

        String key =
                idioma.toLowerCase();

        if (lower.contains(key + " avanzado") ||
                lower.contains(key + " fluent")) {

            return "AVANZADO";
        }

        if (lower.contains(key + " básico")) {

            return "BASICO";
        }

        return "INTERMEDIO";
    }

    private String detectarUniversidad(
            String texto
    ) {

        List<String> universidades =
                List.of(
                        "PUCP",
                        "UPC",
                        "UTEC",
                        "UNI",
                        "UNMSM",
                        "Universidad de Lima",
                        "ESAN"
                );

        for (String universidad :
                universidades) {

            if (texto.toLowerCase().contains(
                    universidad.toLowerCase()
            )) {

                return universidad;
            }
        }

        return "Institución por validar";
    }

    private String detectarCarrera(
            String texto
    ) {

        String lower =
                texto.toLowerCase();

        if (lower.contains("ingeniería")) {
            return "Ingeniería";
        }

        if (lower.contains("administración")) {
            return "Administración";
        }

        if (lower.contains("marketing")) {
            return "Marketing";
        }

        if (lower.contains("finanzas")) {
            return "Finanzas";
        }

        if (lower.contains("contabilidad")) {
            return "Contabilidad";
        }

        return "Carrera por validar";
    }

    private String resumirBloque(
            String bloque
    ) {

        return bloque.length() > 400
                ? bloque.substring(0, 400)
                : bloque;
    }

    private String limpiarLinea(
            String linea
    ) {

        return linea
                .replaceAll("[•●▪]", "")
                .trim();
    }

    private String capitalizar(
            String texto
    ) {

        if (texto == null ||
                texto.isBlank()) {

            return texto;
        }

        texto = texto.toLowerCase();

        return texto.substring(0, 1)
                .toUpperCase()
                + texto.substring(1);
    }

    // =========================================================
    // GUARDAR CV
    // =========================================================

    @Override
    @Transactional
    public CVExtractadoDTO guardarCV(
            CVExtractadoDTO dto,
            String correoUsuario
    ) {

        return dto;
    }

    @Override
    public CVExtractadoDTO obtenerCV(
            String correoUsuario
    ) {

        return new CVExtractadoDTO();
    }

    private NivelDominio parseNivel(
            String nivel
    ) {

        if (nivel == null) {
            return NivelDominio.BASICO;
        }

        try {

            return NivelDominio.valueOf(
                    nivel.toUpperCase()
            );

        } catch (Exception e) {

            return NivelDominio.BASICO;
        }
    }

    private TipoHabilidad parseTipo(
            String tipo
    ) {

        if (tipo == null) {
            return TipoHabilidad.TECNICA;
        }

        try {

            return TipoHabilidad.valueOf(
                    tipo.toUpperCase()
            );

        } catch (Exception e) {

            return TipoHabilidad.TECNICA;
        }
    }
}