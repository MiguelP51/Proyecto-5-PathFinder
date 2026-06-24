"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProfileHeader } from "@/components/profile-setup/profile-header";
import { ProfilePhotoSection } from "@/components/profile-setup/profile-photo-section";
import { CVUploadSection } from "@/components/profile-setup/cv-upload-section";
import { PersonalDataSection } from "@/components/profile-setup/personal-data-section";
import { EducationSection, type Education } from "@/components/profile-setup/education-section";
import {
  WorkExperienceSection,
  type WorkExperience,
} from "@/components/profile-setup/work-experience-section";
import {
  SkillsLanguagesToolsSection,
  type SkillItem,
} from "@/components/profile-setup/skills-languages-tools-section";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import MentorProfileForm from "@/components/mentor/mentor-profile-form";
import { toast } from "sonner";


// ─── Tipos que devuelve el backend ───────────────────────────────────────────

interface CVExtractadoDTO {
  nombreCompleto?: string;
  correoContacto?: string;
  celular?: string;
  provincia?: string;
  distrito?: string;
  linkedinUrl?: string;
  perfilProfesional?: string;
  interesesProfesionales?: string;
  objetivosLaborales?: string;
  experiencias?: Array<{
    empresa?: string;
    cargo?: string;
    fechaInicio?: string;
    fechaFin?: string;
    funcionesRealizadas?: string;
    logrosResultados?: string;
  }>;
  formaciones?: Array<{
    institucion?: string;
    carrera?: string;
    fechaInicio?: string;
    fechaFin?: string;
    cursosRelevantes?: string[] | string;
  }>;
  habilidades?: Array<{ nombre?: string; tipo?: string; nivel?: string }>;
  idiomas?: Array<{ nombre?: string; nivel?: string }>;
  herramientas?: Array<{ nombre?: string; nivel?: string }>;
}


interface AiCvSuggestionsResponse {
  resumenGeneral?: string;
  sugerencias?: Array<{
    seccion?: string;
    prioridad?: string;
    observacion?: string;
    recomendacion?: string;
  }>;
  camposDebiles?: string[];
  versionesMejoradas?: Array<{
    campo?: string;
    valorActual?: string;
    sugerencia?: string;
  }>;
  advertencias?: string[];
}
type SkillLevel = "Básico" | "Intermedio" | "Avanzado";

function normalizeLevel(raw?: string): SkillLevel {
  const map: Record<string, SkillLevel> = {
    básico: "Básico", basico: "Básico", basic: "Básico", beginner: "Básico",
    intermedio: "Intermedio", intermediate: "Intermedio", medio: "Intermedio",
    avanzado: "Avanzado", advanced: "Avanzado", alto: "Avanzado", fluent: "Avanzado",
  };
  return map[(raw || "").toLowerCase().trim()] ?? "Intermedio";
}

const SOFT_SKILLS = [
  "Comunicación efectiva",
  "Trabajo en equipo",
  "Liderazgo",
  "Resolución de problemas",
  "Pensamiento crítico",
  "Adaptabilidad",
  "Gestión del tiempo",
  "Creatividad",
  "Negociación",
  "Inteligencia emocional",
  "Toma de decisiones",
  "Orientación al cliente",
];

function getSkillType(skillName: string): "BLANDA" | "TECNICA" {
  return SOFT_SKILLS.includes(skillName) ? "BLANDA" : "TECNICA";
}

function mapLevelToEnum(level: "Básico" | "Intermedio" | "Avanzado"): "BASICO" | "INTERMEDIO" | "AVANZADO" {
  switch (level) {
    case "Básico":
      return "BASICO";
    case "Avanzado":
      return "AVANZADO";
    case "Intermedio":
    default:
      return "INTERMEDIO";
  }
}

// ─── Helpers de mapeo DTO ↔ estado local ─────────────────────────────────────

function mapDtoToState(dto: any) {
  return {
    personalData: {
      fullName: dto.nombreCompleto || "",
      email: dto.correoContacto || "",
      phone: dto.celular || "",
      region: "",
      provincia: dto.provincia || "",
      distrito: dto.distrito || "",
      linkedinUrl: dto.linkedinUrl || "",
      perfilProfesional: dto.perfilProfesional || "",
      interesesProfesionales: dto.interesesProfesionales || "",
      objetivosLaborales: dto.objetivosLaborales || "",
    },
    educations: (dto.formaciones || []).map((f: any, i: number) => {
      const isCurrentlyStudying = f.enCurso || !f.fechaFin;
      return {
        id: String(i + 1),
        institution: f.institucion || "",
        career: f.carrera || "",
        startDate: f.fechaInicio || "",
        endDate: isCurrentlyStudying ? "" : (f.fechaFin || ""),
        isCurrentlyStudying,
        relevantCourses: Array.isArray(f.cursosRelevantes)
          ? f.cursosRelevantes
          : (typeof f.cursosRelevantes === "string" && f.cursosRelevantes.trim().length > 0)
          ? f.cursosRelevantes.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [],
      };
    }),
    experiences: (dto.experiencias || []).map((e: any, i: number) => {
      const currentlyWorking = e.trabajoActual || !e.fechaFin;
      return {
        id: String(i + 1),
        company: e.empresa || "",
        position: e.cargo || "",
        startDate: e.fechaInicio || "",
        endDate: currentlyWorking ? "" : (e.fechaFin || ""),
        currentlyWorking,
        functions: e.funcionesRealizadas || "",
        achievements: e.logrosResultados || "",
      };
    }),
    skills: (dto.habilidades || []).map((h: any) => ({
      name: h.nombre || "",
      level: normalizeLevel(h.nivel),
    })),
    languages: (dto.idiomas || []).map((i: any) => ({
      name: i.nombre || "",
      level: normalizeLevel(i.nivel),
    })),
    tools: (dto.herramientas || []).map((h: any) => ({
      name: h.nombre || "",
      level: normalizeLevel(h.nivel),
    })),
  };
}

function mapStateToDtoForSave(
  personalData: ReturnType<typeof mapDtoToState>["personalData"],
  educations: Education[],
  experiences: WorkExperience[],
  skills: SkillItem[],
  languages: SkillItem[],
  tools: SkillItem[]
): any {
  // Clean phone number to exactly 9 digits
  const cleanPhone = personalData.phone?.replace(/\D/g, "") || "";
  const formattedPhone = (cleanPhone.startsWith("51") && cleanPhone.length === 11) ? cleanPhone.slice(2) : cleanPhone;
  const finalPhone = formattedPhone.trim() || null;

  // Clean linkedin URL: auto prepend https:// if missing
  let finalLinkedin = personalData.linkedinUrl?.trim() || "";
  if (finalLinkedin && !/^https?:\/\//i.test(finalLinkedin)) {
    if (/^(www\.)?linkedin\.com/i.test(finalLinkedin)) {
      finalLinkedin = `https://${finalLinkedin}`;
    }
  }
  const finalLinkedinUrl = finalLinkedin.trim() || null;

  return {
    nombreCompleto: personalData.fullName?.trim() || null,
    correoContacto: personalData.email?.trim() || null,
    celular: finalPhone,
    provincia: personalData.provincia?.trim() || null,
    distrito: personalData.distrito?.trim() || null,
    linkedinUrl: finalLinkedinUrl,
    perfilProfesional: personalData.perfilProfesional?.trim() || null,
    interesesProfesionales: personalData.interesesProfesionales?.trim() || null,
    objetivosLaborales: personalData.objetivosLaborales?.trim() || null,
    formaciones: educations.map((e) => ({
      institucion: e.institution,
      carrera: e.career,
      fechaInicio: e.startDate,
      fechaFin: e.isCurrentlyStudying ? null : e.endDate,
      enCurso: e.isCurrentlyStudying || false,
      // Enviar cursosRelevantes como string separado por comas al backend
      cursosRelevantes: (e.relevantCourses || []).join(","),
    })),
    experiencias: experiences.map((e) => ({
      empresa: e.company,
      cargo: e.position,
      fechaInicio: e.startDate,
      fechaFin: e.currentlyWorking ? null : e.endDate,
      trabajoActual: e.currentlyWorking || false,
      funcionesRealizadas: e.functions,
      logrosResultados: e.achievements,
    })),
    habilidades: skills.map((s) => ({
      nombre: s.name,
      tipo: getSkillType(s.name),
      nivel: mapLevelToEnum(s.level)
    })),
    idiomas: languages.map((l) => ({
      nombre: l.name,
      nivel: mapLevelToEnum(l.level)
    })),
    herramientas: tools.map((t) => ({
      nombre: t.name,
      nivel: mapLevelToEnum(t.level)
    })),
  };
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ProfileSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isProcessingCV, setIsProcessingCV] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [cvFileName, setCvFileName] = useState("");
  const [pendingCVFile, setPendingCVFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [isProfileConfirmed, setIsProfileConfirmed] = useState(false);
  const [isGeneratingAiSuggestions, setIsGeneratingAiSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AiCvSuggestionsResponse | null>(null);

  // Photo
  const [photoUrl, setPhotoUrl] = useState("");

  // Personal Data
  const [personalData, setPersonalData] = useState({
    fullName: "",
    email: "",
    phone: "",
    region: "",
    provincia: "",
    distrito: "",
    linkedinUrl: "",
    perfilProfesional: "",
    interesesProfesionales: "",
    objetivosLaborales: "",
  });

  const [educations, setEducations] = useState<Education[]>([]);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [languages, setLanguages] = useState<SkillItem[]>([
    { name: "Español", level: "Avanzado" },
  ]);
  const [tools, setTools] = useState<SkillItem[]>([]);

  const loadProfile = async () => {
    if (status === "authenticated" && session?.user?.email) {
      // MENTOR usa su propio formulario, no necesita cargar CV de estudiante
      if (session?.user?.rol === "MENTOR") {
        setIsLoadingData(false);
        return;
      }

      setPersonalData((prev) => ({
        ...prev,
        fullName: session.user?.name || prev.fullName,
        email: session.user?.email || prev.email,
      }));
      setPhotoUrl(session.user?.avatarUrl || session.user?.image || "");

      // Cargar Perfil guardado si existe
      const backendJwt = (session as { backendJwt?: string }).backendJwt;
      try {
        const dto = await apiFetch<any>("/api/profile", {}, backendJwt);
        const mapped = mapDtoToState(dto);
        if (mapped.personalData.fullName) {
          setPersonalData((prev) => ({
            ...prev,
            ...mapped.personalData,
            email: mapped.personalData.email || prev.email,
          }));
          setHasSavedProfile(true);
          setIsEditing(false);
        } else {
          setHasSavedProfile(false);
          setIsEditing(true);
        }
        if (dto.confirmado) {
          setIsProfileConfirmed(true);
        } else {
          setIsProfileConfirmed(false);
        }
        if (dto.cvUploaded) {
          setCvUploaded(true);
          setCvFileName(dto.cvNombreArchivo || "CV.pdf");
        } else {
          setCvUploaded(false);
          setCvFileName("");
        }
        setEducations(mapped.educations.length > 0 ? mapped.educations : []);
        setExperiences(mapped.experiences.length > 0 ? mapped.experiences : []);
        setSkills(mapped.skills.length > 0 ? mapped.skills : []);
        setLanguages(mapped.languages.length > 0 ? mapped.languages : [{ name: "Español", level: "Avanzado" }]);
        setTools(mapped.tools.length > 0 ? mapped.tools : []);
      } catch (err) {
        // Sin perfil guardado aún, no pasa nada
      } finally {
        setIsLoadingData(false);
      }
    } else if (status === "unauthenticated") {
      setIsLoadingData(false);
    }
  };

  // Al cargar la página, intentamos traer el CV guardado del usuario
  useEffect(() => {
    loadProfile();
  }, [status, session]);

  const handleToggleEdit = () => {
    if (isEditing) {
      // Al cancelar, descartamos los cambios, limpiamos el archivo pendiente y recargamos
      setPendingCVFile(null);
      loadProfile();
    } else {
      setIsEditing(true);
    }
  };

  const handlePhotoChange = (file: File) => {
    setPhotoUrl(URL.createObjectURL(file));
  };

  // ── Subir CV al back y autocompletar ──────────────────────────────────────
  const handleCVUpload = async (file: File) => {
    setIsProcessingCV(true);
    setPendingCVFile(file);
    setCvFileName(file.name);
    setError("");

    try {
      const formData = new FormData();
      formData.append("archivo", file);

      // 2. Extraer datos (no requiere auth)
      const dto = await apiFetch<any>("/api/cv/extract", {
        method: "POST",
        body: formData,
      });

      const mapped = mapDtoToState(dto);
      setPersonalData((prev) => ({
        ...prev,
        ...mapped.personalData,
        email: mapped.personalData.email || prev.email,
      }));
      if (mapped.educations.length) setEducations(mapped.educations);
      if (mapped.experiences.length) setExperiences(mapped.experiences);
      if (mapped.skills.length) setSkills(mapped.skills);
      if (mapped.languages.length) setLanguages(mapped.languages);
      if (mapped.tools.length) setTools(mapped.tools);

      setCvUploaded(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error procesando el CV"
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsProcessingCV(false);
    }
  };

  const handleDownloadCV = async (download: boolean) => {
    if (!session?.backendJwt) return;
    try {
      const rawBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      let backendUrl = rawBackendUrl;
      if (rawBackendUrl.endsWith("/api")) {
        backendUrl = rawBackendUrl.slice(0, -4);
      } else if (rawBackendUrl.endsWith("/api/")) {
        backendUrl = rawBackendUrl.slice(0, -5);
      }
      if (typeof window !== "undefined" && backendUrl.startsWith("http")) {
        const currentProtocol = window.location.protocol;
        if (backendUrl.startsWith("http:") && currentProtocol === "https:") {
          backendUrl = backendUrl.replace(/^http:/, "https:");
        } else if (backendUrl.startsWith("https:") && currentProtocol === "http:") {
          backendUrl = backendUrl.replace(/^https:/, "http:");
        }
      }

      const response = await fetch(`${backendUrl}/api/cv/download`, {
        headers: {
          'Authorization': `Bearer ${session.backendJwt}`
        }
      });
      if (!response.ok) throw new Error("No se pudo descargar el archivo de CV.");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      if (download) {
        const a = document.createElement('a');
        a.href = url;
        a.download = cvFileName || "CV.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success("CV descargado correctamente.");
      } else {
        window.open(url, '_blank');
      }
      
      if (download) {
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      }
    } catch (err) {
      console.error("Error al descargar/visualizar mi CV:", err);
      toast.error(err instanceof Error ? err.message : "Error al descargar o visualizar el CV");
    }
  };


  // ── Guardar CV en BD ───────────────────────────────────────────────────────
  const handleGenerateAiSuggestions = async () => {
    const backendJwt = (session as { backendJwt?: string } | null)?.backendJwt;
    if (!backendJwt) return;

    setIsGeneratingAiSuggestions(true);
    setAiSuggestions(null);

    try {
      const response = await apiFetch<AiCvSuggestionsResponse>(
        "/api/ai/estudiante/perfil-cv/sugerencias",
        {
          method: "POST",
          body: JSON.stringify({
            puestoObjetivo: personalData.objetivosLaborales || personalData.interesesProfesionales || null,
            tono: "profesional",
            incluirEjemplos: true,
          }),
        },
        backendJwt,
      );

      setAiSuggestions(response);
      toast.success("Sugerencias generadas.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudieron generar sugerencias");
    } finally {
      setIsGeneratingAiSuggestions(false);
    }
  };

  const validateForm = (): boolean => {
    // 1. Datos Personales
    if (!personalData.fullName.trim()) {
      setError("El nombre completo es obligatorio.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    if (!personalData.email.trim()) {
      setError("El correo de contacto es obligatorio.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    if (!personalData.phone.trim()) {
      setError("El número de celular es obligatorio.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    const cleanPhone = personalData.phone.replace(/\D/g, "");
    const formattedPhone = (cleanPhone.startsWith("51") && cleanPhone.length === 11) ? cleanPhone.slice(2) : cleanPhone;
    if (formattedPhone.length !== 9 || !formattedPhone.startsWith("9")) {
      setError("El número de celular debe comenzar con 9 y tener exactamente 9 dígitos (ej: 999888777).");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    // Update state with cleaned phone number
    if (personalData.phone !== formattedPhone) {
      setPersonalData((prev) => ({ ...prev, phone: formattedPhone }));
    }

    if (!personalData.region) {
      setError("La región es obligatoria.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    if (!personalData.provincia) {
      setError("La provincia es obligatoria.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    if (!personalData.distrito.trim()) {
      setError("El distrito es obligatorio.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    // LinkedIn URL validation and auto-format
    if (personalData.linkedinUrl && personalData.linkedinUrl.trim()) {
      const url = personalData.linkedinUrl.trim();
      let formattedUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        if (/^(www\.)?linkedin\.com/i.test(url)) {
          formattedUrl = `https://${url}`;
        }
      }
      const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.*$/i;
      if (!linkedinRegex.test(formattedUrl)) {
        setError("La URL de LinkedIn no tiene formato válido (ej: https://www.linkedin.com/in/usuario).");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }
      if (personalData.linkedinUrl !== formattedUrl) {
        setPersonalData((prev) => ({ ...prev, linkedinUrl: formattedUrl }));
      }
    }

    // 2. Formación Académica
    if (educations.length === 0) {
      setError("Por favor, agrega al menos una formación académica.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    for (let i = 0; i < educations.length; i++) {
      const edu = educations[i];
      const indexStr = `en la formación académica #${i + 1}`;
      if (!edu.institution.trim()) {
        setError(`La institución ${indexStr} es obligatoria.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }
      if (edu.institution.trim().length < 3) {
        setError(`La institución ${indexStr} debe tener al menos 3 caracteres.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }
      if (!edu.career.trim()) {
        setError(`La carrera ${indexStr} es obligatoria.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }
      if (edu.career.trim().length < 3) {
        setError(`La carrera ${indexStr} debe tener al menos 3 caracteres.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }
      if (!edu.startDate) {
        setError(`La fecha de inicio ${indexStr} es obligatoria.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }
      if (edu.startDate) {
        const start = new Date(edu.startDate);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (start > today) {
          setError(`La fecha de inicio ${indexStr} no puede ser una fecha futura.`);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return false;
        }
      }
      if (!edu.isCurrentlyStudying && !edu.endDate) {
        setError(`La fecha de fin ${indexStr} es obligatoria (o marca 'Actualmente estudio aquí').`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }
      if (!edu.isCurrentlyStudying && edu.startDate && edu.endDate) {
        const start = new Date(edu.startDate);
        const end = new Date(edu.endDate);
        if (end < start) {
          setError(`La fecha de fin ${indexStr} no puede ser anterior a la fecha de inicio.`);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return false;
        }
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (end > today) {
          setError(`La fecha de fin ${indexStr} no puede ser una fecha futura.`);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return false;
        }
      }
    }

    // 3. Experiencia Laboral
    for (let i = 0; i < experiences.length; i++) {
      const exp = experiences[i];
      const indexStr = `en la experiencia laboral #${i + 1}`;
      if (!exp.company.trim()) {
        setError(`La empresa ${indexStr} es obligatoria.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }
      if (!exp.position.trim()) {
        setError(`El cargo ${indexStr} es obligatorio.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }
      if (!exp.startDate) {
        setError(`La fecha de inicio ${indexStr} es obligatoria.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }
      if (exp.startDate) {
        const start = new Date(exp.startDate);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (start > today) {
          setError(`La fecha de inicio ${indexStr} no puede ser una fecha futura.`);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return false;
        }
      }
      if (!exp.currentlyWorking && !exp.endDate) {
        setError(`La fecha de fin ${indexStr} es obligatoria (o marca 'Actualmente trabajo aquí').`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }
      if (!exp.currentlyWorking && exp.startDate && exp.endDate) {
        const start = new Date(exp.startDate);
        const end = new Date(exp.endDate);
        if (end < start) {
          setError(`La fecha de fin ${indexStr} no puede ser anterior a la fecha de inicio.`);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return false;
        }
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (end > today) {
          setError(`La fecha de fin ${indexStr} no puede ser una fecha futura.`);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return false;
        }
      }
      if (!exp.functions.trim()) {
        setError(`Las funciones realizadas ${indexStr} son obligatorias.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }
    }

    // 4. Habilidades, Idiomas y Herramientas
    if (skills.length === 0) {
      setError("Por favor, agrega al menos una habilidad.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }
    if (languages.length === 0) {
      setError("Por favor, agrega al menos un idioma.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }
    if (tools.length === 0) {
      setError("Por favor, agrega al menos una herramienta.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    return true;
  };

  // ── Guardar CV en BD ───────────────────────────────────────────────────────
  const handleSave = async () => {
    setError("");
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const backendJwt = (session as { backendJwt?: string } | null)?.backendJwt;

      // Subir archivo físico al back si hay uno pendiente
      if (pendingCVFile && backendJwt) {
        const formData = new FormData();
        formData.append("archivo", pendingCVFile);
        try {
          await apiFetch("/api/cv/upload", {
            method: "POST",
            body: formData,
          }, backendJwt);
          setPendingCVFile(null); // Limpiar una vez subido con éxito
        } catch (uploadErr) {
          console.error("Error registrando archivo de CV:", uploadErr);
          throw new Error("No se pudo subir el archivo de CV: " + (uploadErr instanceof Error ? uploadErr.message : uploadErr));
        }
      }

      const dto = mapStateToDtoForSave(
        personalData,
        educations,
        experiences,
        skills,
        languages,
        tools
      );

      // PUT /api/profile — requiere JWT emitido por el backend
      await apiFetch<any>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(dto),
      }, backendJwt);

      setHasSavedProfile(true);
      setIsEditing(false);
      toast.success("Perfil guardado con éxito.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error guardando el perfil"
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Confirmar Perfil en BD ──────────────────────────────────────────────────
  const handleConfirm = async () => {
    setError("");
    if (!validateForm()) return;

    setIsConfirming(true);

    try {
      const backendJwt = (session as { backendJwt?: string } | null)?.backendJwt;

      // Subir archivo físico al back si hay uno pendiente
      if (pendingCVFile && backendJwt) {
        const formData = new FormData();
        formData.append("archivo", pendingCVFile);
        try {
          await apiFetch("/api/cv/upload", {
            method: "POST",
            body: formData,
          }, backendJwt);
          setPendingCVFile(null); // Limpiar una vez subido con éxito
        } catch (uploadErr) {
          console.error("Error registrando archivo de CV:", uploadErr);
          throw new Error("No se pudo subir el archivo de CV: " + (uploadErr instanceof Error ? uploadErr.message : uploadErr));
        }
      }

      const dto = mapStateToDtoForSave(
        personalData,
        educations,
        experiences,
        skills,
        languages,
        tools
      );

      // 1. Guardar primero el borrador más actualizado
      await apiFetch<any>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(dto),
      }, backendJwt);

      // 2. Confirmar el perfil para avanzar etapas
      await apiFetch<any>("/api/profile/confirm", {
        method: "POST",
      }, backendJwt);

      setIsProfileConfirmed(true);
      router.push("/user/home");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error confirmando el perfil"
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSkip = async () => {
    if (hasSavedProfile) {
      router.push("/?session=active");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const dto = mapStateToDtoForSave(
        {
          fullName: session?.user?.name || personalData.fullName || "Estudiante",
          email: session?.user?.email || personalData.email || "",
          phone: "",
          region: "",
          provincia: "",
          distrito: "",
          linkedinUrl: "",
          perfilProfesional: "",
          interesesProfesionales: "",
          objetivosLaborales: "",
        },
        [],
        [],
        [],
        [],
        []
      );

      // PUT /api/profile para crear la entrada vacía y que no vuelva a bloquear el login
      await apiFetch<any>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(dto),
      }, (session as { backendJwt?: string } | null)?.backendJwt);

      const redirectUrl = session?.user?.rol === "MENTOR" ? "/dashboard" : "/?session=active";
      router.push(redirectUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error omitiendo el perfil"
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  };

  // Progreso
  const isPhoneValid = (() => {
    const cleanPhone = personalData.phone.replace(/\D/g, "");
    const formattedPhone = (cleanPhone.startsWith("51") && cleanPhone.length === 11) ? cleanPhone.slice(2) : cleanPhone;
    return formattedPhone.length === 9 && formattedPhone.startsWith("9");
  })();

  const isEducationValid = (() => {
    if (educations.length === 0) return false;
    return educations.every(edu => 
      edu.institution.trim().length >= 3 &&
      edu.career.trim().length >= 3 &&
      edu.startDate !== "" &&
      (edu.isCurrentlyStudying || edu.endDate !== "") &&
      (edu.isCurrentlyStudying || new Date(edu.endDate) >= new Date(edu.startDate))
    );
  })();

  const isExperienceValid = (() => {
    if (experiences.length === 0) return true;
    return experiences.every(exp => 
      exp.company.trim() !== "" &&
      exp.position.trim() !== "" &&
      exp.startDate !== "" &&
      (exp.currentlyWorking || exp.endDate !== "") &&
      (exp.currentlyWorking || new Date(exp.endDate) >= new Date(exp.startDate)) &&
      exp.functions.trim() !== ""
    );
  })();

  const completionItems = [
    personalData.fullName.trim() !== "",                               // 1. Nombre Completo no vacío
    isPhoneValid,                                                      // 2. Celular válido (empieza con 9, tiene 9 dígitos)
    personalData.region.trim() !== "",                                 // 3. Región seleccionada
    personalData.provincia.trim() !== "",                              // 4. Provincia seleccionada
    personalData.distrito.trim() !== "",                               // 5. Distrito seleccionado
    isEducationValid,                                                  // 6. Al menos una formación válida
    isExperienceValid,                                                 // 7. Experiencias válidas (si las hay)
    skills.length > 0,                                                 // 8. Al menos una habilidad
    languages.length > 0,                                              // 9. Al menos un idioma
    tools.length > 0,                                                  // 10. Al menos una herramienta
  ];
  const completedItems = completionItems.filter(Boolean).length;
  const completionPercentage = Math.round(
    (completedItems / completionItems.length) * 100
  );

  const pendingItems: string[] = [];
  if (personalData.fullName.trim() === "") pendingItems.push("Nombre completo");
  if (!isPhoneValid) pendingItems.push("Celular");
  if (personalData.region.trim() === "") pendingItems.push("Región");
  if (personalData.provincia.trim() === "") pendingItems.push("Provincia");
  if (personalData.distrito.trim() === "") pendingItems.push("Distrito");
  if (!isEducationValid) pendingItems.push("Formación académica");
  if (!isExperienceValid) pendingItems.push("Experiencia laboral (incompleta)");
  if (skills.length === 0) pendingItems.push("Habilidades");
  if (languages.length === 0) pendingItems.push("Idiomas");
  if (tools.length === 0) pendingItems.push("Herramientas");

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#0E3E66]" />
          <p className="text-lg font-medium text-slate-600">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  if (session?.user?.rol === "MENTOR") {
    return <MentorProfileForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <ProfileHeader
        onSave={handleSave}
        onSkip={handleSkip}
        onConfirm={isProfileConfirmed ? undefined : handleConfirm}
        isSaving={isSaving}
        isConfirming={isConfirming}
        canConfirm={completionPercentage === 100}
        completionPercentage={completionPercentage}
        pendingItems={pendingItems}
        isEditing={isEditing}
        onToggleEdit={handleToggleEdit}
        hasSavedProfile={hasSavedProfile}
        onBackToDashboard={() => router.push("/user/home")}
      />

      <main className="container mx-auto px-4 py-8 md:px-6">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Profile Photo + Progress Bar Row */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex-shrink-0 p-4">
            <ProfilePhotoSection
              photoUrl={photoUrl}
              userName={personalData.fullName}
              onPhotoChange={handlePhotoChange}
              compact
              disabled={!isEditing}
            />
          </div>

          <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#0E3E66]">
                  Progreso del perfil
                </h2>
                <p className="text-sm text-slate-500">
                  Completa tu perfil para tener mejores oportunidades
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-[#0E3E66]">
                  {completionPercentage}%
                </span>
                <p className="text-sm text-slate-500">completado</p>
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0E3E66] via-[#643781] to-[#B9309C] transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
          {/* Left Sidebar */}
          <div className="space-y-6">
            <CVUploadSection
              onCVUpload={handleCVUpload}
              isProcessing={isProcessingCV}
              cvUploaded={cvUploaded}
              cvFileName={cvFileName}
              disabled={!isEditing}
              onDownloadCV={handleDownloadCV}
            />

            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#643781]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0E3E66]">Sugerencias para tu CV</h3>
                  <p className="text-sm text-slate-500">Ideas revisables para fortalecer tu perfil.</p>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGenerateAiSuggestions}
                disabled={isGeneratingAiSuggestions || isProcessingCV}
                className="w-full bg-[#643781] text-white hover:bg-[#552a70]"
              >
                {isGeneratingAiSuggestions ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generar sugerencias
                  </>
                )}
              </Button>

              {aiSuggestions && (
                <div className="mt-5 space-y-4 text-sm">
                  {aiSuggestions.resumenGeneral && (
                    <div className="rounded-xl bg-slate-50 p-3 text-slate-700">
                      {aiSuggestions.resumenGeneral}
                    </div>
                  )}

                  {aiSuggestions.sugerencias && aiSuggestions.sugerencias.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Recomendaciones</p>
                      {aiSuggestions.sugerencias.slice(0, 4).map((item, index) => (
                        <div key={`${item.seccion}-${index}`} className="rounded-xl border border-slate-100 p-3">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-800">{item.seccion || "General"}</span>
                            {item.prioridad && (
                              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-[#643781]">
                                {item.prioridad}
                              </span>
                            )}
                          </div>
                          {item.observacion && <p className="text-slate-500">{item.observacion}</p>}
                          {item.recomendacion && <p className="mt-2 text-slate-700">{item.recomendacion}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {aiSuggestions.camposDebiles && aiSuggestions.camposDebiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Por reforzar</p>
                      <ul className="space-y-1 text-slate-600">
                        {aiSuggestions.camposDebiles.slice(0, 5).map((item, index) => (
                          <li key={`${item}-${index}`}>- {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#0E3E66] to-[#643781] p-6 text-white shadow-sm">
              <h3 className="mb-3 font-semibold">💡 Consejos</h3>
              <ul className="space-y-2 text-sm text-white/90">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>Sube tu CV para autocompletar tu perfil</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>Completa todas las secciones para destacar</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>Agrega habilidades relevantes para el puesto</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <PersonalDataSection
                data={personalData}
                onChange={(val) => setPersonalData((prev) => ({ ...prev, ...val }))}
                disabled={!isEditing}
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <EducationSection
                educations={educations}
                onChange={setEducations}
                disabled={!isEditing}
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <WorkExperienceSection
                experiences={experiences}
                onChange={setExperiences}
                disabled={!isEditing}
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <SkillsLanguagesToolsSection
                skills={skills}
                languages={languages}
                tools={tools}
                onSkillsChange={setSkills}
                onLanguagesChange={setLanguages}
                onToolsChange={setTools}
                disabled={!isEditing}
              />
            </section>

            <div className="pb-8" />
          </div>
        </div>
      </main>
    </div>
  );
}
