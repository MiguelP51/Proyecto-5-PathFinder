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
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

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
    descripcion?: string;
    logros?: string;
  }>;
  formaciones?: Array<{
    institucion?: string;
    carrera?: string;
    fechaInicio?: string;
    fechaFin?: string;
    cursosRelevantes?: string[];
  }>;
  habilidades?: Array<{ nombre?: string; tipo?: string; nivel?: string }>;
  idiomas?: Array<{ nombre?: string; nivel?: string }>;
  herramientas?: Array<{ nombre?: string; nivel?: string }>;
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

// ─── Helpers de mapeo DTO ↔ estado local ─────────────────────────────────────

function mapDtoToState(dto: CVExtractadoDTO) {
  return {
    personalData: {
      fullName: dto.nombreCompleto || "",
      email: dto.correoContacto || "",
      phone: dto.celular || "",
      region: "",
      provincia: dto.provincia || "",
      distrito: dto.distrito || "",
    },
    educations: (dto.formaciones || []).map((f, i) => ({
      id: String(i + 1),
      institution: f.institucion || "",
      career: f.carrera || "",
      startDate: f.fechaInicio || "",
      endDate: f.fechaFin || "",
      relevantCourses: f.cursosRelevantes || [],
    })),
    experiences: (dto.experiencias || []).map((e, i) => ({
      id: String(i + 1),
      company: e.empresa || "",
      position: e.cargo || "",
      startDate: e.fechaInicio || "",
      endDate: e.fechaFin || "",
      functions: e.descripcion || "",
      achievements: e.logros || "",
    })),
    skills: (dto.habilidades || []).map((h) => ({
      name: h.nombre || "",
      level: normalizeLevel(h.nivel),
    })),
    languages: (dto.idiomas || []).map((i) => ({
      name: i.nombre || "",
      level: normalizeLevel(i.nivel),
    })),
    tools: (dto.herramientas || []).map((h) => ({
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
): CVExtractadoDTO {
  return {
    nombreCompleto: personalData.fullName,
    correoContacto: personalData.email,
    celular: personalData.phone,
    provincia: personalData.provincia,
    distrito: personalData.distrito,
    formaciones: educations.map((e) => ({
      institucion: e.institution,
      carrera: e.career,
      fechaInicio: e.startDate,
      fechaFin: e.endDate,
      cursosRelevantes: e.relevantCourses,
    })),
    experiencias: experiences.map((e) => ({
      empresa: e.company,
      cargo: e.position,
      fechaInicio: e.startDate,
      fechaFin: e.endDate,
      descripcion: e.functions,
      logros: e.achievements,
    })),
    habilidades: skills.map((s) => ({ nombre: s.name, nivel: s.level })),
    idiomas: languages.map((l) => ({ nombre: l.name, nivel: l.level })),
    herramientas: tools.map((t) => ({ nombre: t.name, nivel: t.level })),
  };
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ProfileSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingCV, setIsProcessingCV] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [cvFileName, setCvFileName] = useState("");
  const [error, setError] = useState("");

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
  });

  const [educations, setEducations] = useState<Education[]>([]);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [languages, setLanguages] = useState<SkillItem[]>([
    { name: "Español", level: "Avanzado" },
  ]);
  const [tools, setTools] = useState<SkillItem[]>([]);

  // Al cargar la página, intentamos traer el CV guardado del usuario
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      setPersonalData((prev) => ({
        ...prev,
        fullName: session.user?.name || prev.fullName,
        email: session.user?.email || prev.email,
      }));
      setPhotoUrl(session.user?.image || "");

      // Cargar CV guardado si existe
      const idToken = (session as { googleIdToken?: string }).googleIdToken;
      apiFetch<CVExtractadoDTO>("/api/cv/me", {}, idToken)
        .then((dto) => {
          const mapped = mapDtoToState(dto);
          if (mapped.personalData.fullName) {
            setPersonalData((prev) => ({ ...prev, ...mapped.personalData }));
          }
          if (mapped.educations.length > 0) setEducations(mapped.educations);
          if (mapped.experiences.length > 0) setExperiences(mapped.experiences);
          if (mapped.skills.length > 0) setSkills(mapped.skills);
          if (mapped.languages.length > 0) setLanguages(mapped.languages);
          if (mapped.tools.length > 0) setTools(mapped.tools);
        })
        .catch(() => {
          // Sin CV guardado aún, no pasa nada
        });
    }
  }, [status, session]);

  const handlePhotoChange = (file: File) => {
    setPhotoUrl(URL.createObjectURL(file));
  };

  // ── Subir CV al back y autocompletar ──────────────────────────────────────
  const handleCVUpload = async (file: File) => {
    setIsProcessingCV(true);
    setCvFileName(file.name);
    setError("");

    try {
      const formData = new FormData();
      formData.append("archivo", file);

      // POST /api/cv/extract — no requiere auth
      const dto = await apiFetch<CVExtractadoDTO>("/api/cv/extract", {
        method: "POST",
        body: formData,
      });

      const mapped = mapDtoToState(dto);
      setPersonalData((prev) => ({ ...prev, ...mapped.personalData }));
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
    } finally {
      setIsProcessingCV(false);
    }
  };

  // ── Guardar CV en BD ───────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      const dto = mapStateToDtoForSave(
        personalData,
        educations,
        experiences,
        skills,
        languages,
        tools
      );

      // PUT /api/cv/save — requiere JWT de Google (que el back valida)
      await apiFetch<CVExtractadoDTO>("/api/cv/save", {
        method: "PUT",
        body: JSON.stringify(dto),
      }, (session as { googleIdToken?: string } | null)?.googleIdToken);

      router.push("/home");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error guardando el perfil"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    router.push("/home");
  };

  // Progreso
  const completionItems = [
    personalData.fullName,
    personalData.phone,
    personalData.provincia,
    educations.length > 0,
    skills.length > 0,
    languages.length > 0,
    tools.length > 0,
  ];
  const completedItems = completionItems.filter(Boolean).length;
  const completionPercentage = Math.round(
    (completedItems / completionItems.length) * 100
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <ProfileHeader
        onSave={handleSave}
        onSkip={handleSkip}
        isSaving={isSaving}
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
            />

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
                onChange={setPersonalData}
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <EducationSection
                educations={educations}
                onChange={setEducations}
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <WorkExperienceSection
                experiences={experiences}
                onChange={setExperiences}
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
              />
            </section>

            <div className="flex justify-end gap-4 pb-8">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="border-slate-300 text-slate-600 hover:bg-slate-100"
              >
                Omitir por ahora
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="lg"
                className="bg-gradient-to-r from-[#0E3E66] via-[#643781] to-[#8E348F] text-white hover:opacity-90"
              >
                {isSaving ? (
                  "Guardando..."
                ) : (
                  <>
                    Guardar y Continuar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
