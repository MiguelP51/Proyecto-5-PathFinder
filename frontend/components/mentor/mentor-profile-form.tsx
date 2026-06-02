"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProfileHeader } from "@/components/profile-setup/profile-header";
import { ProfilePhotoSection } from "@/components/profile-setup/profile-photo-section";
import {
  EducationSection,
  type Education,
} from "@/components/profile-setup/education-section";
import {
  WorkExperienceSection,
  type WorkExperience,
} from "@/components/profile-setup/work-experience-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface CVExtractadoDTO {
  nombreCompleto?: string;
  correoContacto?: string;
  celular?: string;
  linkedinUrl?: string;
  perfilProfesional?: string;
  interesesProfesionales?: string;
  formaciones?: Array<{
    institucion?: string;
    carrera?: string;
    fechaInicio?: string;
    fechaFin?: string;
    cursosRelevantes?: string[] | string;
  }>;
  experiencias?: Array<{
    empresa?: string;
    cargo?: string;
    fechaInicio?: string;
    fechaFin?: string;
    funcionesRealizadas?: string;
    logrosResultados?: string;
  }>;
}

const SPECIALIZATION_AREAS = [
  "Desarrollo Profesional",
  "Orientación Vocacional",
  "Psicología Organizacional",
  "Recursos Humanos",
  "Marketing",
  "Finanzas",
  "Comercial / Ventas",
  "Logística",
  "Tecnología",
  "Educación",
  "Emprendimiento",
  "Salud y Bienestar",
];

function mapDtoToState(dto: CVExtractadoDTO) {
  return {
    fullName: dto.nombreCompleto || "",
    email: dto.correoContacto || "",
    phone: dto.celular || "",
    linkedinUrl: dto.linkedinUrl || "",
    professionalBio: dto.perfilProfesional || "",
    specializationAreas: (dto.interesesProfesionales || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    educations: (dto.formaciones || []).map((f, i) => ({
      id: String(i + 1),
      institution: f.institucion || "",
      career: f.carrera || "",
      startDate: f.fechaInicio || "",
      endDate: f.fechaFin || "",
      relevantCourses: Array.isArray(f.cursosRelevantes)
        ? f.cursosRelevantes
        : typeof f.cursosRelevantes === "string" && f.cursosRelevantes.trim()
          ? f.cursosRelevantes.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
    })),
    experiences: (dto.experiencias || []).map((e, i) => ({
      id: String(i + 1),
      company: e.empresa || "",
      position: e.cargo || "",
      startDate: e.fechaInicio || "",
      endDate: e.fechaFin || "",
      functions: e.funcionesRealizadas || "",
      achievements: e.logrosResultados || "",
    })),
  };
}

function mapStateToDto(state: ReturnType<typeof mapDtoToState>): CVExtractadoDTO {
  return {
    nombreCompleto: state.fullName,
    correoContacto: state.email,
    celular: state.phone,
    linkedinUrl: state.linkedinUrl,
    perfilProfesional: state.professionalBio,
    interesesProfesionales: state.specializationAreas.join(", "),
    formaciones: state.educations.map((e) => ({
      institucion: e.institution,
      carrera: e.career,
      fechaInicio: e.startDate,
      fechaFin: e.endDate,
      cursosRelevantes: (e.relevantCourses || []).join(","),
    })),
    experiencias: state.experiences.map((e) => ({
      empresa: e.company,
      cargo: e.position,
      fechaInicio: e.startDate,
      fechaFin: e.endDate,
      funcionesRealizadas: e.functions,
      logrosResultados: e.achievements,
    })),
  };
}

export default function MentorProfileForm() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [professionalBio, setProfessionalBio] = useState("");
  const [specializationAreas, setSpecializationAreas] = useState<string[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      setFullName(session.user?.name || "");
      setEmail(session.user?.email || "");
      setPhotoUrl(session.user?.avatarUrl || session.user?.image || "");

      const backendJwt = (session as { backendJwt?: string }).backendJwt;
      apiFetch<CVExtractadoDTO>("/api/cv/me", {}, backendJwt)
        .then((dto) => {
          const mapped = mapDtoToState(dto);
          if (mapped.fullName) setFullName(mapped.fullName);
          if (mapped.email) setEmail(mapped.email);
          if (mapped.phone) setPhone(mapped.phone);
          if (mapped.linkedinUrl) setLinkedinUrl(mapped.linkedinUrl);
          if (mapped.professionalBio) setProfessionalBio(mapped.professionalBio);
          if (mapped.specializationAreas.length > 0)
            setSpecializationAreas(mapped.specializationAreas);
          if (mapped.educations.length > 0) setEducations(mapped.educations);
          if (mapped.experiences.length > 0) setExperiences(mapped.experiences);
        })
        .catch(() => {})
        .finally(() => setIsLoadingData(false));
    } else if (status === "unauthenticated") {
      setIsLoadingData(false);
    }
  }, [status, session]);

  const handlePhotoChange = (file: File) => {
    setPhotoUrl(URL.createObjectURL(file));
  };

  const toggleSpecialization = (area: string) => {
    setSpecializationAreas((prev) =>
      prev.includes(area)
        ? prev.filter((a) => a !== area)
        : [...prev, area]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      const state = {
        fullName,
        email,
        phone,
        linkedinUrl,
        professionalBio,
        specializationAreas,
        educations,
        experiences,
      };
      const dto = mapStateToDto(state);

      await apiFetch<CVExtractadoDTO>(
        "/api/cv/save",
        {
          method: "PUT",
          body: JSON.stringify(dto),
        },
        (session as { backendJwt?: string } | null)?.backendJwt
      );

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error guardando el perfil"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#0E3E66]" />
          <p className="text-lg font-medium text-slate-600">
            Cargando tu perfil...
          </p>
        </div>
      </div>
    );
  }

  const completionItems = [
    fullName,
    phone,
    professionalBio,
    specializationAreas.length > 0,
    educations.length > 0,
  ];
  const completedCount = completionItems.filter(Boolean).length;
  const completionPercentage = Math.round(
    (completedCount / completionItems.length) * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <ProfileHeader
        onSave={handleSave}
        onSkip={() => router.push("/dashboard")}
        isSaving={isSaving}
        hideSkip
      />

      <main className="container mx-auto px-4 py-8 md:px-6">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex-shrink-0 p-4">
            <ProfilePhotoSection
              photoUrl={photoUrl}
              userName={fullName}
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
                  Completa tu perfil profesional para empezar a orientar
                  estudiantes
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
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#0E3E66] to-[#643781] p-6 text-white shadow-sm">
              <h3 className="mb-3 font-semibold">
                Información para Mentores
              </h3>
              <ul className="space-y-2 text-sm text-white/90">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    Comparte tu experiencia profesional para inspirar
                    estudiantes
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    Selecciona las áreas en las que puedes orientar
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    Tu perfil ayuda a los estudiantes a elegir al mentor
                    adecuado
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0E3E66] to-[#643781]">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-[#0E3E66]">
                    Datos Personales
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-700">
                      Nombre Completo
                    </Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Tu nombre completo"
                      className="border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">
                      Correo Electrónico
                    </Label>
                    <Input
                      type="email"
                      value={email}
                      readOnly
                      className="border-slate-200 bg-slate-50"
                    />
                    <p className="text-xs text-slate-400">
                      Vinculado a tu cuenta de Google
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">Celular</Label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+51 999 999 999"
                      className="border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">LinkedIn</Label>
                    <Input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/tu-perfil"
                      className="border-slate-200"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#393B74] to-[#643781]">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-[#0E3E66]">
                    Biografía Profesional
                  </h2>
                </div>
                <Textarea
                  value={professionalBio}
                  onChange={(e) => setProfessionalBio(e.target.value)}
                  placeholder="Cuéntales a los estudiantes sobre tu trayectoria profesional, experiencia como mentor/orientador, y cómo puedes ayudarles..."
                  rows={5}
                  className="border-slate-200"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#643781] to-[#8E348F]">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-[#0E3E66]">
                    Áreas de Especialización
                  </h2>
                </div>
                <p className="text-sm text-slate-500">
                  Selecciona las áreas en las que puedes orientar a los
                  estudiantes
                </p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {SPECIALIZATION_AREAS.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleSpecialization(area)}
                      className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                        specializationAreas.includes(area)
                          ? "border-[#643781] bg-[#643781]/10 text-[#643781]"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {specializationAreas.includes(area) && (
                        <CheckCircle2 className="mr-2 inline h-4 w-4" />
                      )}
                      {area}
                    </button>
                  ))}
                </div>
              </div>
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

            <div className="flex justify-end pb-8">
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
