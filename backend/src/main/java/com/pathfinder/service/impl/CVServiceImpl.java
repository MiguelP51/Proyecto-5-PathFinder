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
import java.util.stream.Collectors;

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
            "Análisis de Datos", "Business Intelligence", "SQL", "Python",
            "Estadística", "Machine Learning", "Data Science",
            "Gestión de Proyectos", "Gestión de Procesos", "Mejora Continua",
            "Lean Manufacturing", "Six Sigma", "Investigación de Operaciones",
            "Supply Chain", "Logística", "Planeamiento Estratégico",
            "Scrum", "Agile", "Design Thinking", "BPMN",
            "Finanzas Corporativas", "Contabilidad", "Marketing Digital",
            "Gestión Comercial", "KPIs", "Auditoría", "Tributación",
            "Derecho Corporativo", "Recursos Humanos", "Selección de Personal",
            "Gestión de Calidad", "ISO 9001", "Investigación de Mercados"
    );

    private static final List<String> HABILIDADES_BLANDAS = List.of(
            "Liderazgo", "Comunicación Efectiva", "Trabajo en Equipo",
            "Resolución de Problemas", "Pensamiento Analítico",
            "Pensamiento Estratégico", "Toma de Decisiones",
            "Orientación a Resultados", "Adaptabilidad", "Negociación",
            "Organización", "Proactividad", "Gestión del Tiempo",
            "Empatía", "Creatividad", "Innovación", "Autonomía"
    );

    private static final List<String> HERRAMIENTAS = List.of(
            "Excel", "Word", "PowerPoint", "Power BI", "Tableau",
            "Minitab", "SPSS", "SAP", "Salesforce", "HubSpot",
            "Oracle ERP", "MS Project", "Bizagi", "Microsoft Visio",
            "AutoCAD", "Jira", "Trello", "Asana", "Slack", "Notion",
            "Google Workspace", "Google Sheets", "Google Docs",
            "Canva", "Figma", "Adobe", "R Studio", "MATLAB"
    );

    private static final List<String> IDIOMAS_CONOCIDOS = List.of(
            "Inglés", "Español", "Portugués", "Francés", "Alemán",
            "Italiano", "Chino", "Japonés", "English"
    );

    // Universidades peruanas — lista ampliada
    private static final List<String> UNIVERSIDADES = List.of(
            "Pontificia Universidad Católica del Perú", "PUCP",
            "Universidad de Lima", "U de Lima",
            "Universidad del Pacífico", "UP",
            "Universidad Peruana de Ciencias Aplicadas", "UPC",
            "Universidad de Ingeniería y Tecnología", "UTEC",
            "Universidad Nacional de Ingeniería", "UNI",
            "Universidad Nacional Mayor de San Marcos", "UNMSM", "San Marcos",
            "Universidad Ricardo Palma", "URP",
            "Universidad San Martín de Porres", "USMP",
            "Universidad Cayetano Heredia", "UPCH",
            "Universidad ESAN", "ESAN",
            "Universidad Peruana Unión", "UPeU",
            "Universidad Continental",
            "Universidad Científica del Sur",
            "Universidad Privada del Norte", "UPN",
            "Universidad Tecnológica del Perú", "UTP",
            "Universidad San Ignacio de Loyola", "USIL",
            "Universidad Inca Garcilaso de la Vega",
            "Universidad Wiener",
            "Instituto TECSUP", "TECSUP",
            "Instituto SENATI", "SENATI",
            "Instituto San Ignacio de Loyola", "ISIL"
    );

    // Carreras con nombre completo para mejor detección
    private static final Map<String, String> CARRERAS = new LinkedHashMap<>() {{
        put("ingeniería industrial", "Ingeniería Industrial");
        put("ingeniería de sistemas", "Ingeniería de Sistemas");
        put("ingeniería informática", "Ingeniería Informática");
        put("ingeniería civil", "Ingeniería Civil");
        put("ingeniería mecánica", "Ingeniería Mecánica");
        put("ingeniería electrónica", "Ingeniería Electrónica");
        put("ingeniería económica", "Ingeniería Económica");
        put("ingeniería ambiental", "Ingeniería Ambiental");
        put("administración de empresas", "Administración de Empresas");
        put("administración de negocios", "Administración de Negocios");
        put("administración", "Administración");
        put("contabilidad", "Contabilidad");
        put("economía", "Economía");
        put("finanzas", "Finanzas");
        put("marketing", "Marketing");
        put("comunicaciones", "Comunicaciones");
        put("derecho", "Derecho");
        put("psicología", "Psicología");
        put("negocios internacionales", "Negocios Internacionales");
        put("comercio exterior", "Comercio Exterior");
        put("gestión empresarial", "Gestión Empresarial");
        put("gestión y alta dirección", "Gestión y Alta Dirección");
        put("arquitectura", "Arquitectura");
        put("medicina", "Medicina");
        put("enfermería", "Enfermería");
        put("nutrición", "Nutrición");
    }};

    private static final Map<String, List<String>> SECTION_ALIASES = Map.of(
            "perfil", List.of(
                    "perfil profesional", "perfil", "resumen profesional",
                    "resumen", "sobre mi", "acerca de mi",
                    "profile", "summary", "objetivo profesional", "objetivo"
            ),
            "experiencia", List.of(
                    "experiencia laboral", "experiencia profesional",
                    "experiencia", "trayectoria laboral",
                    "work experience", "experience", "prácticas preprofesionales",
                    "practicas preprofesionales", "practicas"
            ),
            "educacion", List.of(
                    "formación académica", "formacion academica",
                    "educación", "educacion",
                    "academic background", "estudios", "education"
            ),
            "habilidades", List.of(
                    "habilidades", "competencias", "skills",
                    "aptitudes", "fortalezas", "habilidades blandas",
                    "competencias blandas"
            ),
            "idiomas", List.of("idiomas", "languages", "idioma"),
            "herramientas", List.of(
                    "informática", "informatica", "software", "tools",
                    "herramientas", "herramientas digitales",
                    "tecnología", "tecnologias", "conocimientos técnicos",
                    "conocimientos tecnicos", "manejo de software"
            ),
            "certificaciones", List.of(
                    "certificaciones", "cursos", "diplomados",
                    "certifications", "courses", "capacitaciones"
            ),
            "voluntariado", List.of(
                    "voluntariado", "actividades extracurriculares",
                    "extracurricular", "logros", "actividades"
            )
    );

    // Regex
    private static final Pattern PATRON_CORREO =
            Pattern.compile("[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}");

    private static final Pattern PATRON_TELEFONO =
            Pattern.compile("(\\+?51[\\s-]?)?9\\d{2}[\\s-]?\\d{3}[\\s-]?\\d{3}");

    private static final Pattern PATRON_LINKEDIN =
            Pattern.compile("(https?://)?(www\\.)?linkedin\\.com/in/[A-Za-z0-9\\-_./]+",
                    Pattern.CASE_INSENSITIVE);

    // Fechas: 03/2022, 03-2022, marzo 2022, mar. 2022
    private static final Pattern PATRON_MES_ANIO =
            Pattern.compile(
                    "(?:(\\d{1,2})[/\\-](\\d{4}))|" +
                            "(?:(enero|febrero|marzo|abril|mayo|junio|julio|agosto|" +
                            "septiembre|octubre|noviembre|diciembre|" +
                            "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)" +
                            "[.\\s]+(\\d{4}))",
                    Pattern.CASE_INSENSITIVE);

    private static final Pattern PATRON_RANGO_FECHAS =
            Pattern.compile(
                    "(?:(\\d{1,2})[/\\-](\\d{4}))\\s*[-–]\\s*" +
                            "(?:(actualidad|actual|presente|current|a la fecha)|(?:(\\d{1,2})[/\\-](\\d{4})))",
                    Pattern.CASE_INSENSITIVE);

    // Nivel de idioma: B1, B2, C1, C2, nativo, básico, intermedio, avanzado
    private static final Pattern PATRON_NIVEL_IDIOMA =
            Pattern.compile(
                    "\\b(A1|A2|B1|B2|C1|C2|nativo|native|básico|basico|" +
                            "elemental|intermedio|intermediate|avanzado|advanced|fluido|fluent)\\b",
                    Pattern.CASE_INSENSITIVE);

    private static final Map<String, Integer> MESES = Map.ofEntries(
            Map.entry("enero", 1), Map.entry("jan", 1),
            Map.entry("febrero", 2), Map.entry("feb", 2),
            Map.entry("marzo", 3), Map.entry("mar", 3),
            Map.entry("abril", 4), Map.entry("apr", 4),
            Map.entry("mayo", 5), Map.entry("may", 5),
            Map.entry("junio", 6), Map.entry("jun", 6),
            Map.entry("julio", 7), Map.entry("jul", 7),
            Map.entry("agosto", 8), Map.entry("aug", 8),
            Map.entry("septiembre", 9), Map.entry("sep", 9),
            Map.entry("octubre", 10), Map.entry("oct", 10),
            Map.entry("noviembre", 11), Map.entry("nov", 11),
            Map.entry("diciembre", 12), Map.entry("dec", 12)
    );

    // =========================================================
    // EXTRAER CV
    // =========================================================

    @Override
    public CVExtractadoDTO extraerCV(MultipartFile archivo) throws Exception {
        validarArchivo(archivo);
        String texto = extraerTextoPDF(archivo);
        texto = limpiarTexto(texto);

        log.debug("======= TEXTO EXTRAÍDO =======\n{}\n======= FIN =======", texto);

        return parsearCV(texto);
    }

    private void validarArchivo(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty())
            throw new RuntimeException("El archivo está vacío");

        String nombre = archivo.getOriginalFilename();
        if (nombre == null || !nombre.toLowerCase().endsWith(".pdf"))
            throw new RuntimeException("Solo se permiten PDFs");
    }

    private String extraerTextoPDF(MultipartFile archivo) throws IOException {
        try (var doc = Loader.loadPDF(archivo.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
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
                .replaceAll("\n{3,}", "\n\n")
                .trim();
    }

    // =========================================================
    // PARSEAR CV
    // =========================================================

    private CVExtractadoDTO parsearCV(String texto) {
        Map<String, String> secciones = extraerSecciones(texto);

        CVExtractadoDTO dto = new CVExtractadoDTO();
        dto.setNombreCompleto(extraerNombre(texto));
        dto.setCorreoContacto(extraerCorreo(texto));
        dto.setCelular(extraerTelefono(texto));
        dto.setLinkedinUrl(extraerLinkedin(texto));
        extraerUbicacion(texto, dto);
        dto.setPerfilProfesional(extraerPerfil(secciones));
        dto.setExperiencias(extraerExperiencias(secciones));
        dto.setFormaciones(extraerFormaciones(secciones));
        dto.setHabilidades(eliminarDuplicadosHabilidades(extraerHabilidades(secciones)));
        dto.setHerramientas(extraerHerramientas(secciones));
        dto.setIdiomas(extraerIdiomas(secciones, texto));

        return dto;
    }

    // =========================================================
    // SECCIONES
    // =========================================================

    private Map<String, String> extraerSecciones(String texto) {
        String[] lineas = texto.split("\n");
        Map<String, Integer> posiciones = new LinkedHashMap<>();

        for (int i = 0; i < lineas.length; i++) {
            String lineaNorm = normalizar(lineas[i]);
            // Solo considera como encabezado líneas cortas (< 60 chars)
            if (lineas[i].trim().length() > 60) continue;

            for (var entry : SECTION_ALIASES.entrySet()) {
                for (String alias : entry.getValue()) {
                    if (lineaNorm.equals(alias) || lineaNorm.startsWith(alias)) {
                        posiciones.putIfAbsent(entry.getKey(), i);
                    }
                }
            }
        }

        Map<String, String> secciones = new LinkedHashMap<>();
        if (posiciones.isEmpty()) {
            secciones.put("general", texto);
            return secciones;
        }

        List<Map.Entry<String, Integer>> lista = new ArrayList<>(posiciones.entrySet());
        for (int i = 0; i < lista.size(); i++) {
            int inicio = lista.get(i).getValue();
            int fin = (i + 1 < lista.size()) ? lista.get(i + 1).getValue() : lineas.length;
            String contenido = String.join("\n", Arrays.copyOfRange(lineas, inicio, fin));
            secciones.put(lista.get(i).getKey(), contenido);
        }

        log.info("Secciones detectadas: {}", secciones.keySet());
        return secciones;
    }

    // =========================================================
    // DATOS BÁSICOS
    // =========================================================

    private String extraerNombre(String texto) {
        String[] lineas = texto.split("\n");
        List<String> prohibidas = List.of(
                "curriculum", "cv ", "hoja de vida", "datos personales",
                "perfil", "experiencia", "educacion", "educación",
                "habilidades", "idiomas", "contacto", "tel", "cel",
                "@", "http", "linkedin", "www"
        );

        for (int i = 0; i < Math.min(10, lineas.length); i++) {
            String linea = lineas[i].trim();
            if (linea.length() < 4 || linea.length() > 60) continue;

            String norm = normalizar(linea);
            if (prohibidas.stream().anyMatch(norm::contains)) continue;

            // Acepta: mayúscula inicial, TODO CAPS, o mixto — mínimo 2 palabras
            if (linea.matches("^[A-ZÁÉÍÓÚÑ][A-ZA-Za-záéíóúñÁÉÍÓÚÑ]+" +
                    "(\\s+[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñÁÉÍÓÚÑ]+){1,4}$") ||
                    linea.matches("^[A-ZÁÉÍÓÚÑ ]+(\\s[A-ZÁÉÍÓÚÑ]+){1,4}$")) {
                return toTitleCase(linea);
            }
        }
        return null;
    }

    private String extraerCorreo(String texto) {
        Matcher m = PATRON_CORREO.matcher(texto);
        return m.find() ? m.group() : null;
    }

    private String extraerTelefono(String texto) {
        Matcher m = PATRON_TELEFONO.matcher(texto);
        if (m.find()) return m.group().replaceAll("[^0-9+]", "");
        return null;
    }

    private String extraerLinkedin(String texto) {
        Matcher m = PATRON_LINKEDIN.matcher(texto);
        return m.find() ? m.group() : null;
    }

    private void extraerUbicacion(String texto, CVExtractadoDTO dto) {
        // Formato: Distrito, Provincia, Perú
        Pattern p1 = Pattern.compile(
                "([A-Za-zÁÉÍÓÚÑáéíóúñ ]+),\\s*([A-Za-zÁÉÍÓÚÑáéíóúñ ]+),\\s*Per[uú]",
                Pattern.CASE_INSENSITIVE);
        Matcher m1 = p1.matcher(texto);
        if (m1.find()) {
            dto.setDistrito(m1.group(1).trim());
            dto.setProvincia(m1.group(2).trim());
            return;
        }

        // Formato: Lima, Perú o solo Lima
        Pattern p2 = Pattern.compile(
                "\\b(Lima|Arequipa|Trujillo|Chiclayo|Cusco|Piura|Iquitos|Huancayo)\\b",
                Pattern.CASE_INSENSITIVE);
        Matcher m2 = p2.matcher(texto);
        if (m2.find()) {
            dto.setProvincia(m2.group(1));
        }
    }

    private String extraerPerfil(Map<String, String> secciones) {
        String perfil = secciones.get("perfil");
        if (perfil == null) return null;

        // Quita el encabezado de sección
        perfil = perfil.replaceFirst("(?i)perfil\\s*profesional", "")
                .replaceFirst("(?i)resumen\\s*profesional", "")
                .replaceFirst("(?i)perfil", "")
                .replaceFirst("(?i)resumen", "")
                .replaceFirst("(?i)objetivo\\s*profesional", "")
                .trim();

        return perfil.length() > 1500 ? perfil.substring(0, 1500) : perfil;
    }

    // =========================================================
    // EXPERIENCIAS
    // =========================================================

    private List<ExperienciaLaboralDTO> extraerExperiencias(Map<String, String> secciones) {
        List<ExperienciaLaboralDTO> lista = new ArrayList<>();
        String seccion = secciones.get("experiencia");
        if (seccion == null) return lista;

        // Divide por líneas en blanco O por líneas que contienen un rango de fechas
        String[] lineas = seccion.split("\n");
        List<List<String>> bloques = new ArrayList<>();
        List<String> bloqueActual = new ArrayList<>();

        for (String linea : lineas) {
            if (linea.trim().isEmpty()) {
                if (!bloqueActual.isEmpty()) {
                    bloques.add(new ArrayList<>(bloqueActual));
                    bloqueActual.clear();
                }
            } else {
                bloqueActual.add(linea);
            }
        }
        if (!bloqueActual.isEmpty()) bloques.add(bloqueActual);

        for (List<String> bloque : bloques) {
            String texto = String.join("\n", bloque);
            if (!PATRON_RANGO_FECHAS.matcher(texto).find()) continue;
            if (bloque.size() < 2) continue;

            ExperienciaLaboralDTO dto = new ExperienciaLaboralDTO();

            // Primera línea no vacía → empresa
            String empresa = bloque.get(0).trim();
            // Limpia fechas que puedan estar en la misma línea
            empresa = empresa.replaceAll("\\d{1,2}/\\d{4}.*", "").trim();
            dto.setEmpresa(limpiarLinea(empresa));

            // Segunda línea → cargo
            if (bloque.size() > 1) {
                String cargo = bloque.get(1).trim();
                cargo = cargo.replaceAll("\\d{1,2}/\\d{4}.*", "").trim();
                dto.setCargo(limpiarLinea(cargo));
            }

            // Resto del bloque → funciones
            if (bloque.size() > 2) {
                String funciones = bloque.subList(2, bloque.size())
                        .stream()
                        .map(String::trim)
                        .filter(l -> !l.isEmpty())
                        .collect(Collectors.joining("\n"));
                dto.setFuncionesRealizadas(funciones.length() > 500 ? funciones.substring(0, 500) : funciones);
            }

            extraerFechasRango(texto, dto);
            lista.add(dto);
        }

        return lista;
    }

    private void extraerFechasRango(String texto, ExperienciaLaboralDTO dto) {
        Matcher m = PATRON_RANGO_FECHAS.matcher(texto);
        if (!m.find()) return;

        try {
            int mes = Integer.parseInt(m.group(1));
            int anio = Integer.parseInt(m.group(2));
            dto.setFechaInicio(LocalDate.of(anio, mes, 1));
        } catch (Exception ignored) {}

        try {
            // Si tiene fecha fin numérica
            if (m.group(4) != null && m.group(5) != null) {
                int mesFin = Integer.parseInt(m.group(4));
                int anioFin = Integer.parseInt(m.group(5));
                dto.setFechaFin(LocalDate.of(anioFin, mesFin, 1));
            }
            // Si dice "actualidad", fechaFin queda null (trabajo actual)
        } catch (Exception ignored) {}
    }

    // =========================================================
    // FORMACIÓN
    // =========================================================

    private List<FormacionAcademicaDTO> extraerFormaciones(Map<String, String> secciones) {
        List<FormacionAcademicaDTO> lista = new ArrayList<>();
        String seccion = secciones.get("educacion");
        if (seccion == null) return lista;

        String[] lineas = seccion.split("\n");
        List<List<String>> bloques = new ArrayList<>();
        List<String> bloqueActual = new ArrayList<>();

        for (String linea : lineas) {
            if (linea.trim().isEmpty()) {
                if (!bloqueActual.isEmpty()) {
                    bloques.add(new ArrayList<>(bloqueActual));
                    bloqueActual.clear();
                }
            } else {
                bloqueActual.add(linea);
            }
        }
        if (!bloqueActual.isEmpty()) bloques.add(bloqueActual);

        for (List<String> bloque : bloques) {
            String texto = String.join("\n", bloque);
            // Debe tener al menos un año de 4 dígitos para ser formación
            if (!texto.matches("(?s).*\\b(19|20)\\d{2}\\b.*") && !texto.contains("cursando")) continue;
            if (bloque.isEmpty()) continue;

            FormacionAcademicaDTO dto = new FormacionAcademicaDTO();
            dto.setInstitucion(detectarUniversidad(texto));
            dto.setCarrera(detectarCarrera(texto));
            extraerFechasFormacion(texto, dto);

            lista.add(dto);
        }

        return lista;
    }

    private void extraerFechasFormacion(String texto, FormacionAcademicaDTO dto) {
        Matcher m = PATRON_MES_ANIO.matcher(texto);
        List<LocalDate> fechas = new ArrayList<>();

        while (m.find()) {
            try {
                if (m.group(1) != null) {
                    // Formato numérico: 03/2022
                    int mes = Integer.parseInt(m.group(1));
                    int anio = Integer.parseInt(m.group(2));
                    if (mes >= 1 && mes <= 12) fechas.add(LocalDate.of(anio, mes, 1));
                } else {
                    // Formato texto: marzo 2022
                    String mesStr = m.group(3).toLowerCase().substring(0, 3);
                    int mes = MESES.getOrDefault(mesStr, 0);
                    int anio = Integer.parseInt(m.group(4));
                    if (mes > 0) fechas.add(LocalDate.of(anio, mes, 1));
                }
            } catch (Exception ignored) {}
        }

        // También busca años sueltos: 2018 - 2022
        if (fechas.isEmpty()) {
            Pattern aniosPattern = Pattern.compile("(\\d{4})\\s*[-–]\\s*(\\d{4}|actualidad|actual|presente)",
                    Pattern.CASE_INSENSITIVE);
            Matcher am = aniosPattern.matcher(texto);
            if (am.find()) {
                try { fechas.add(LocalDate.of(Integer.parseInt(am.group(1)), 1, 1)); } catch (Exception ignored) {}
                try {
                    if (!am.group(2).matches("(?i)actualidad|actual|presente"))
                        fechas.add(LocalDate.of(Integer.parseInt(am.group(2)), 12, 1));
                } catch (Exception ignored) {}
            }
        }

        if (!fechas.isEmpty()) dto.setFechaInicio(fechas.get(0));
        if (fechas.size() > 1) dto.setFechaFin(fechas.get(fechas.size() - 1));
    }

    // =========================================================
    // HABILIDADES
    // =========================================================

    private List<HabilidadDTO> extraerHabilidades(Map<String, String> secciones) {
        List<HabilidadDTO> lista = new ArrayList<>();

        // Busca en toda el CV, no solo en la sección de habilidades
        String textoCompleto = String.join(" ", secciones.values()).toLowerCase();

        for (String habilidad : HABILIDADES_TECNICAS) {
            if (textoCompleto.contains(habilidad.toLowerCase())) {
                HabilidadDTO dto = new HabilidadDTO();
                dto.setNombre(habilidad);
                dto.setTipo("TECNICA");
                dto.setNivel(detectarNivelEnContexto(textoCompleto, habilidad));
                lista.add(dto);
            }
        }

        // Habilidades blandas — busca solo en la sección de habilidades para evitar falsos positivos
        String seccionHabilidades = secciones.getOrDefault("habilidades", textoCompleto);
        for (String habilidad : HABILIDADES_BLANDAS) {
            if (seccionHabilidades.toLowerCase().contains(habilidad.toLowerCase())) {
                HabilidadDTO dto = new HabilidadDTO();
                dto.setNombre(habilidad);
                dto.setTipo("BLANDA");
                dto.setNivel("INTERMEDIO");
                lista.add(dto);
            }
        }

        return lista;
    }

    private List<HabilidadDTO> eliminarDuplicadosHabilidades(List<HabilidadDTO> lista) {
        Map<String, HabilidadDTO> map = new LinkedHashMap<>();
        for (HabilidadDTO dto : lista) {
            map.put(dto.getNombre().toLowerCase(), dto);
        }
        return new ArrayList<>(map.values());
    }

    // =========================================================
    // IDIOMAS — detecta B1/B2/C1/C2 además de texto libre
    // =========================================================

    private List<IdiomaDTO> extraerIdiomas(Map<String, String> secciones, String textoCompleto) {
        List<IdiomaDTO> lista = new ArrayList<>();

        // Busca primero en la sección de idiomas, luego en todo el CV
        String textoIdiomas = secciones.getOrDefault("idiomas", textoCompleto);

        for (String idioma : IDIOMAS_CONOCIDOS) {
            String idiomaCanon = idioma.equals("English") ? "Inglés" : idioma;
            boolean yaAgregado = lista.stream()
                    .anyMatch(i -> i.getNombre().equalsIgnoreCase(idiomaCanon));
            if (yaAgregado) continue;

            if (textoIdiomas.toLowerCase().contains(idioma.toLowerCase())) {
                IdiomaDTO dto = new IdiomaDTO();
                dto.setNombre(idiomaCanon);
                dto.setNivel(detectarNivelIdioma(textoIdiomas, idioma));
                lista.add(dto);
            }
        }

        return lista;
    }

    private String detectarNivelIdioma(String texto, String idioma) {
        // Busca el nivel en las 2 líneas cercanas al idioma
        String[] lineas = texto.split("\n");
        for (int i = 0; i < lineas.length; i++) {
            if (lineas[i].toLowerCase().contains(idioma.toLowerCase())) {
                // Revisa esta línea y la siguiente
                String contexto = lineas[i];
                if (i + 1 < lineas.length) contexto += " " + lineas[i + 1];

                Matcher m = PATRON_NIVEL_IDIOMA.matcher(contexto);
                if (m.find()) {
                    return mapearNivelIdioma(m.group(1));
                }
            }
        }
        return "INTERMEDIO";
    }

    private String mapearNivelIdioma(String nivel) {
        return switch (nivel.toUpperCase()) {
            case "C2", "NATIVO", "NATIVE", "FLUIDO", "FLUENT" -> "AVANZADO";
            case "C1", "AVANZADO", "ADVANCED" -> "AVANZADO";
            case "B2", "INTERMEDIO", "INTERMEDIATE" -> "INTERMEDIO";
            case "B1" -> "INTERMEDIO";
            case "A2", "BÁSICO", "BASICO", "ELEMENTAL" -> "BASICO";
            case "A1" -> "BASICO";
            default -> "INTERMEDIO";
        };
    }

    // =========================================================
    // HERRAMIENTAS
    // =========================================================

    private List<HerramientaDTO> extraerHerramientas(Map<String, String> secciones) {
        List<HerramientaDTO> lista = new ArrayList<>();

        // Busca en herramientas + texto completo para no perder menciones en experiencia
        String textoCompleto = String.join(" ", secciones.values());
        String lower = textoCompleto.toLowerCase();

        for (String herramienta : HERRAMIENTAS) {
            if (lower.contains(herramienta.toLowerCase())) {
                HerramientaDTO dto = new HerramientaDTO();
                dto.setNombre(herramienta);
                dto.setNivel(detectarNivelEnContexto(textoCompleto, herramienta));
                lista.add(dto);
            }
        }

        return lista;
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private String detectarNivelEnContexto(String texto, String keyword) {
        String lower = texto.toLowerCase();
        String key = keyword.toLowerCase();

        // Busca en un radio de 30 chars alrededor de la keyword
        int idx = lower.indexOf(key);
        if (idx == -1) return "INTERMEDIO";

        String ventana = lower.substring(
                Math.max(0, idx - 30),
                Math.min(lower.length(), idx + key.length() + 30)
        );

        if (ventana.contains("avanzado") || ventana.contains("advanced") || ventana.contains("expert"))
            return "AVANZADO";
        if (ventana.contains("básico") || ventana.contains("basico") || ventana.contains("basic"))
            return "BASICO";

        return "INTERMEDIO";
    }

    private String detectarUniversidad(String texto) {
        String lower = texto.toLowerCase();
        for (String universidad : UNIVERSIDADES) {
            if (lower.contains(universidad.toLowerCase())) {
                return universidad;
            }
        }
        // Si tiene "universidad" o "instituto" en el texto, extrae el nombre
        Pattern p = Pattern.compile(
                "(universidad|instituto|escuela)\\s+[a-záéíóúñ\\s]+",
                Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(texto);
        if (m.find()) return toTitleCase(m.group().trim());

        return "Institución por validar";
    }

    private String detectarCarrera(String texto) {
        String lower = normalizar(texto);
        for (Map.Entry<String, String> entry : CARRERAS.entrySet()) {
            if (lower.contains(entry.getKey())) return entry.getValue();
        }
        return "Carrera por validar";
    }

    private String normalizar(String texto) {
        if (texto == null) return "";
        texto = Normalizer.normalize(texto, Normalizer.Form.NFD);
        texto = texto.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return texto.toLowerCase()
                .replace("•", "").replace("●", "").replace("▪", "")
                .replaceAll("\\s+", " ").trim();
    }

    private String limpiarLinea(String linea) {
        return linea.replaceAll("[•●▪►]", "").trim();
    }

    private String toTitleCase(String texto) {
        if (texto == null || texto.isBlank()) return texto;
        String[] palabras = texto.toLowerCase().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String p : palabras) {
            if (!p.isEmpty()) {
                sb.append(Character.toUpperCase(p.charAt(0)))
                        .append(p.substring(1)).append(" ");
            }
        }
        return sb.toString().trim();
    }

    // =========================================================
    // GUARDAR CV
    // =========================================================

    @Override
    @Transactional
    public CVExtractadoDTO guardarCV(CVExtractadoDTO dto, String correoUsuario) {
        Usuario usuario = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + correoUsuario));

        // Upsert: crea o actualiza el perfil
        PerfilCV perfil = perfilCVRepository.findByUsuario_Correo(correoUsuario)
                .orElseGet(() -> {
                    PerfilCV nuevo = new PerfilCV();
                    nuevo.setUsuario(usuario);
                    return nuevo;
                });

        perfil.setCorreoContacto(dto.getCorreoContacto());
        perfil.setCelular(dto.getCelular());
        perfil.setProvincia(dto.getProvincia());
        perfil.setDistrito(dto.getDistrito());
        perfil.setLinkedinUrl(dto.getLinkedinUrl());
        perfil.setPerfilProfesional(dto.getPerfilProfesional());
        perfil.setInteresesProfesionales(dto.getInteresesProfesionales());
        perfil.setObjetivosLaborales(dto.getObjetivosLaborales());
        perfil.setFechaActualizacionCv(LocalDateTime.now());
        perfilCVRepository.save(perfil);

        // Marcar como usuario que ya completó su perfil
        usuario.setNuevoUsuario(false);
        usuarioRepository.save(usuario);

        // Experiencias — borra las anteriores y guarda las nuevas
        experienciaRepo.deleteByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv());
        if (dto.getExperiencias() != null) {
            for (ExperienciaLaboralDTO expDto : dto.getExperiencias()) {
                ExperienciaLaboral exp = new ExperienciaLaboral();
                exp.setPerfilCv(perfil);
                exp.setEmpresa(expDto.getEmpresa());
                exp.setCargo(expDto.getCargo());
                exp.setFechaInicio(expDto.getFechaInicio());
                exp.setFechaFin(expDto.getFechaFin());
                exp.setFuncionesRealizadas(expDto.getFuncionesRealizadas());
                exp.setLogrosResultados(expDto.getLogrosResultados());
                experienciaRepo.save(exp);
            }
        }

        // Formaciones
        formacionRepo.deleteByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv());
        if (dto.getFormaciones() != null) {
            for (FormacionAcademicaDTO formDto : dto.getFormaciones()) {
                FormacionAcademica form = new FormacionAcademica();
                form.setPerfilCv(perfil);
                form.setInstitucion(formDto.getInstitucion());
                form.setCarrera(formDto.getCarrera());
                form.setFechaInicio(formDto.getFechaInicio());
                form.setFechaFin(formDto.getFechaFin());
                form.setCursosRelevantes(formDto.getCursosRelevantes());
                formacionRepo.save(form);
            }
        }

        // Habilidades — guarda en catálogo y perfil
        perfilHabilidadRepo.deleteByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv());
        if (dto.getHabilidades() != null) {
            for (HabilidadDTO habDto : dto.getHabilidades()) {
                Habilidad habilidad = habilidadRepo.findByNombreHabilidadIgnoreCase(habDto.getNombre())
                        .orElseGet(() -> {
                            Habilidad nueva = new Habilidad();
                            nueva.setNombreHabilidad(habDto.getNombre());
                            nueva.setTipoHabilidad(parseTipo(habDto.getTipo()));
                            return habilidadRepo.save(nueva);
                        });

                PerfilCVHabilidad rel = new PerfilCVHabilidad();
                rel.setPerfilCv(perfil);
                rel.setHabilidad(habilidad);
                rel.setNivel(parseNivel(habDto.getNivel()));
                perfilHabilidadRepo.save(rel);
            }
        }

        // Idiomas
        perfilIdiomaRepo.deleteByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv());
        if (dto.getIdiomas() != null) {
            for (IdiomaDTO idiomaDto : dto.getIdiomas()) {
                Idioma idioma = idiomaRepo.findByNombreIdiomaIgnoreCase(idiomaDto.getNombre())
                        .orElseGet(() -> {
                            Idioma nuevo = new Idioma();
                            nuevo.setNombreIdioma(idiomaDto.getNombre());
                            return idiomaRepo.save(nuevo);
                        });

                PerfilCVIdioma rel = new PerfilCVIdioma();
                rel.setPerfilCv(perfil);
                rel.setIdioma(idioma);
                rel.setNivel(parseNivel(idiomaDto.getNivel()));
                perfilIdiomaRepo.save(rel);
            }
        }

        // Herramientas
        perfilHerramientaRepo.deleteByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv());
        if (dto.getHerramientas() != null) {
            for (HerramientaDTO herrDto : dto.getHerramientas()) {
                HerramientaDigital herramienta = herramientaRepo.findByNombreHerramientaIgnoreCase(herrDto.getNombre())
                        .orElseGet(() -> {
                            HerramientaDigital nueva = new HerramientaDigital();
                            nueva.setNombreHerramienta(herrDto.getNombre());
                            return herramientaRepo.save(nueva);
                        });

                PerfilCVHerramienta rel = new PerfilCVHerramienta();
                rel.setPerfilCv(perfil);
                rel.setHerramientaDigital(herramienta);
                rel.setNivel(parseNivel(herrDto.getNivel()));
                perfilHerramientaRepo.save(rel);
            }
        }

        return obtenerCV(correoUsuario);
    }

    // =========================================================
    // OBTENER CV
    // =========================================================

    @Override
    public CVExtractadoDTO obtenerCV(String correoUsuario) {
        PerfilCV perfil = perfilCVRepository.findByUsuario_Correo(correoUsuario)
                .orElseThrow(() -> new RuntimeException("CV no encontrado para: " + correoUsuario));

        CVExtractadoDTO dto = new CVExtractadoDTO();
        dto.setNombreCompleto(perfil.getUsuario().getNombreCompleto());
        dto.setCorreoContacto(perfil.getCorreoContacto());
        dto.setCelular(perfil.getCelular());
        dto.setProvincia(perfil.getProvincia());
        dto.setDistrito(perfil.getDistrito());
        dto.setLinkedinUrl(perfil.getLinkedinUrl());
        dto.setPerfilProfesional(perfil.getPerfilProfesional());
        dto.setInteresesProfesionales(perfil.getInteresesProfesionales());
        dto.setObjetivosLaborales(perfil.getObjetivosLaborales());

        // Experiencias
        dto.setExperiencias(
                experienciaRepo.findByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv())
                        .stream().map(e -> {
                            ExperienciaLaboralDTO d = new ExperienciaLaboralDTO();
                            d.setId(e.getIdExperiencia());
                            d.setEmpresa(e.getEmpresa());
                            d.setCargo(e.getCargo());
                            d.setFechaInicio(e.getFechaInicio());
                            d.setFechaFin(e.getFechaFin());
                            d.setFuncionesRealizadas(e.getFuncionesRealizadas());
                            d.setLogrosResultados(e.getLogrosResultados());
                            return d;
                        }).collect(Collectors.toList())
        );

        // Formaciones
        dto.setFormaciones(
                formacionRepo.findByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv())
                        .stream().map(f -> {
                            FormacionAcademicaDTO d = new FormacionAcademicaDTO();
                            d.setId(f.getIdFormacion());
                            d.setInstitucion(f.getInstitucion());
                            d.setCarrera(f.getCarrera());
                            d.setFechaInicio(f.getFechaInicio());
                            d.setFechaFin(f.getFechaFin());
                            d.setCursosRelevantes(f.getCursosRelevantes());
                            return d;
                        }).collect(Collectors.toList())
        );

        // Habilidades
        dto.setHabilidades(
                perfilHabilidadRepo.findByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv())
                        .stream().map(ph -> {
                            HabilidadDTO d = new HabilidadDTO();
                            d.setId(ph.getHabilidad().getIdHabilidad());
                            d.setNombre(ph.getHabilidad().getNombreHabilidad());
                            d.setTipo(ph.getHabilidad().getTipoHabilidad().name());
                            d.setNivel(ph.getNivel().name());
                            return d;
                        }).collect(Collectors.toList())
        );

        // Idiomas
        dto.setIdiomas(
                perfilIdiomaRepo.findByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv())
                        .stream().map(pi -> {
                            IdiomaDTO d = new IdiomaDTO();
                            d.setId(pi.getIdioma().getIdIdioma());
                            d.setNombre(pi.getIdioma().getNombreIdioma());
                            d.setNivel(pi.getNivel().name());
                            return d;
                        }).collect(Collectors.toList())
        );

        // Herramientas
        dto.setHerramientas(
                perfilHerramientaRepo.findByPerfilCv_IdPerfilCv(perfil.getIdPerfilCv())
                        .stream().map(ph -> {
                            HerramientaDTO d = new HerramientaDTO();
                            d.setId(ph.getHerramientaDigital().getIdHerramienta());
                            d.setNombre(ph.getHerramientaDigital().getNombreHerramienta());
                            d.setNivel(ph.getNivel().name());
                            return d;
                        }).collect(Collectors.toList())
        );

        return dto;
    }

    // =========================================================
    // HELPERS ENUMS
    // =========================================================

    private NivelDominio parseNivel(String nivel) {
        if (nivel == null) return NivelDominio.INTERMEDIO;
        try { return NivelDominio.valueOf(nivel.toUpperCase()); }
        catch (Exception e) { return NivelDominio.INTERMEDIO; }
    }

    private TipoHabilidad parseTipo(String tipo) {
        if (tipo == null) return TipoHabilidad.TECNICA;
        try { return TipoHabilidad.valueOf(tipo.toUpperCase()); }
        catch (Exception e) { return TipoHabilidad.TECNICA; }
    }
}