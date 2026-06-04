"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  Brain,
  Calendar,
  CheckCircle2,
  Lock,
  Loader2,
  UserCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";


interface EstadoEstudianteResponse {
  tienePerfilCV: boolean;
  perfilConfirmado: boolean;
  etapaActual: string;
  etapas: {
    CARGA_CV: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA";
    REVISION_PERFIL: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA";
    CONFIRMACION_PERFIL: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA";
    TEST_DISC: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA";
    AGENDAMIENTO_ENTREVISTA?: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA";
    EVALUACION_ENTREVISTA?: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA";
  };
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [studentStatus, setStudentStatus] = useState<EstadoEstudianteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.backendJwt) {
      loadStudentStatus();
    }
  }, [status, session]);

  const loadStudentStatus = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch<EstadoEstudianteResponse>(
        "/api/users/me/status",
        { next: { revalidate: 0 } } as any,
        session?.backendJwt
      );
      setStudentStatus(data);
    } catch (err) {
      console.error("Error cargando estado del estudiante:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar el progreso. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#7447D7]" />
          <p className="text-lg font-medium text-slate-600">Cargando tu progreso en PathFinder...</p>
        </div>
      </div>
    );
  }

  if (error || !studentStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <article className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-6 shadow-md text-center">
          <p className="text-red-500 font-bold">Ups, algo salió mal</p>
          <p className="mt-2 text-slate-600">{error || "No pudimos obtener tu estado actual."}</p>
          <button
            onClick={loadStudentStatus}
            className="mt-6 h-11 w-full rounded-xl bg-[#7447D7] font-bold text-white transition hover:opacity-90 cursor-pointer"
          >
            Reintentar
          </button>
        </article>
      </div>
    );
  }

  // Determinar estados de las etapas
  const step1Completed = studentStatus.perfilConfirmado;
  const step2Active = step1Completed && studentStatus.etapas.TEST_DISC !== "COMPLETADA";
  const step2Completed = studentStatus.etapas.TEST_DISC === "COMPLETADA";
  
  const step3Active = step2Completed;

  // Calcular porcentaje total
  let progressPercent = 0;
  if (studentStatus.perfilConfirmado) progressPercent += 25;
  if (studentStatus.etapas.TEST_DISC === "COMPLETADA") progressPercent += 25;
  if (studentStatus.etapas.AGENDAMIENTO_ENTREVISTA === "COMPLETADA") progressPercent += 25;
  if (studentStatus.etapas.EVALUACION_ENTREVISTA === "COMPLETADA") progressPercent += 25;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/10 text-slate-900 pb-16 font-sans">
      <main className="mx-auto w-full max-w-5xl px-4 py-10 md:py-12">
        
        {/* Encabezado */}
        <section className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              ¡Hola, {session?.user?.name || "Estudiante"}! 👋
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Bienvenido a tu panel de control. Aquí puedes seguir y completar tu ruta de preparación profesional.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-purple-50 border border-purple-100 p-4">
            <Sparkles className="h-6 w-6 text-[#7447D7] animate-pulse" />
            <div>
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block">Tu Ruta PathFinder</span>
              <span className="text-sm font-bold text-purple-900">Preparación de Perfil & Simulación</span>
            </div>
          </div>
        </section>

        {/* Progreso General */}
        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Progreso de Selección General</h2>
            <span className="text-2xl font-black text-[#7447D7]">{progressPercent}%</span>
          </div>
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7447D7] via-[#B412F0] to-[#D43EE6] transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Completa las tareas para estar listo y postular a tu primera experiencia laboral formal.
          </p>
        </section>

        {/* Fila 1: Tareas Pendientes y Activas (Paso 1 y Paso 2) */}
        <section className="mb-10">
          <h2 className="text-xl font-extrabold text-slate-800 mb-6">Tareas Pendientes y Activas</h2>
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Paso 1: Configuración de Perfil */}
            <article className={`relative rounded-3xl border p-6 shadow-sm flex flex-col justify-between transition duration-300 hover:shadow-md ${
              step1Completed 
                ? "border-emerald-200 bg-emerald-50/10" 
                : "border-purple-200 bg-white ring-1 ring-purple-100"
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    step1Completed ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-[#7447D7]"
                  }`}>
                    {step1Completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                    Paso 1
                  </span>
                  <span className={`text-xs font-semibold ${step1Completed ? "text-emerald-700" : "text-purple-700"}`}>
                    {step1Completed ? "Completado" : "Activo"}
                  </span>
                </div>
                <div className="flex gap-4">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
                    step1Completed ? "bg-emerald-100 text-emerald-600" : "bg-purple-100 text-[#7447D7]"
                  }`}>
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Registro y Configuración de Perfil</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      Completa tu información personal, formación académica, experiencia laboral y sube tu CV redactado.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
                <Link
                  href="/user/profile"
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition ${
                    step1Completed
                      ? "border border-slate-200 bg-white text-slate-700 hover:border-[#7447D7] hover:text-[#7447D7]"
                      : "bg-[#7447D7] text-white hover:opacity-90"
                  }`}
                >
                  {step1Completed ? "Ver Perfil" : "Completar perfil"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>

            {/* Paso 2: Evaluación Psicométrica DISC */}
            <article className={`relative rounded-3xl border p-6 shadow-sm flex flex-col justify-between transition duration-300 ${
              step2Completed 
                ? "border-emerald-200 bg-emerald-50/10 hover:shadow-md" 
                : step2Active 
                ? "border-purple-200 bg-white ring-1 ring-purple-100 hover:shadow-md" 
                : "border-slate-200 bg-slate-100/50 opacity-60"
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    step2Completed 
                      ? "bg-emerald-100 text-emerald-800" 
                      : step2Active 
                      ? "bg-purple-100 text-[#7447D7]" 
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    {step2Completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : !step2Active ? <Lock className="h-3.5 w-3.5" /> : null}
                    Paso 2
                  </span>
                  <span className={`text-xs font-semibold ${
                    step2Completed 
                      ? "text-emerald-700" 
                      : step2Active 
                      ? "text-purple-700" 
                      : "text-slate-500"
                  }`}>
                    {step2Completed ? "Completada" : step2Active ? "Disponible" : "Bloqueada"}
                  </span>
                </div>
                <div className="flex gap-4">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
                    step2Completed 
                      ? "bg-emerald-100 text-emerald-600" 
                      : step2Active 
                      ? "bg-purple-100 text-[#7447D7]" 
                      : "bg-slate-200 text-slate-400"
                  }`}>
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Evaluación Psicométrica DISC</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      Descubre tu perfil de comportamiento natural bajo 4 dimensiones clave para encontrar tu mejor ajuste laboral.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
                {step2Completed ? (
                  <Link
                    href="/user/app/disc-results"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-[#7447D7] hover:text-[#7447D7]"
                  >
                    Ver resultados
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : step2Active ? (
                  <Link
                    href="/user/app/disc-intro"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7447D7] to-[#D43EE6] px-5 text-sm font-bold text-white transition hover:opacity-90 shadow-md shadow-purple-200/50"
                  >
                    Iniciar prueba
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-200 px-5 text-sm font-bold text-slate-400 cursor-not-allowed"
                  >
                    <Lock className="h-4 w-4" />
                    Bloqueado
                  </button>
                )}
              </div>
            </article>

          </div>
        </section>

        {/* Fila 2: Siguientes Pasos (Opciones Bloqueadas / Futuras) */}
        <section>
          <h2 className="text-xl font-extrabold text-slate-800 mb-6">Siguientes Pasos (Opciones Bloqueadas)</h2>
          <div className="grid gap-6">
            
            {/* Paso 3: Entrevista con PathMentor */}
            <article className={`relative rounded-3xl border p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition duration-300 ${
              step3Active 
                ? "border-purple-200 bg-white ring-1 ring-purple-100 hover:shadow-md" 
                : "border-slate-200 bg-slate-100/50 opacity-60"
            }`}>
              <div className="flex gap-4">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
                  step3Active ? "bg-purple-100 text-[#7447D7]" : "bg-slate-200 text-slate-400"
                }`}>
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-lg font-bold text-slate-800">Paso 3: Entrevista con PathMentor</h3>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                      studentStatus.etapas.EVALUACION_ENTREVISTA === "COMPLETADA"
                        ? "bg-emerald-100 text-emerald-800"
                        : studentStatus.etapas.AGENDAMIENTO_ENTREVISTA === "COMPLETADA"
                        ? "bg-blue-100 text-blue-800"
                        : step3Active
                        ? "bg-purple-100 text-[#7447D7]"
                        : "bg-slate-200 text-slate-600"
                    }`}>
                      {!step3Active && <Lock className="h-3 w-3" />}
                      {studentStatus.etapas.EVALUACION_ENTREVISTA === "COMPLETADA"
                        ? "Completado"
                        : studentStatus.etapas.AGENDAMIENTO_ENTREVISTA === "COMPLETADA"
                        ? "Agendada"
                        : step3Active
                        ? "Disponible"
                        : "Bloqueado"}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 max-w-2xl">
                    Una vez que obtengas tu perfil conductual DISC, podrás agendar una simulación de entrevista con tu mentor para perfeccionar tus respuestas.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center justify-end">
                {step3Active ? (
                  <Link
                    href={
                      studentStatus.etapas.AGENDAMIENTO_ENTREVISTA === "COMPLETADA"
                        ? "/user/app/simulation-details"
                        : "/user/app/simulation-intro"
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7447D7] to-[#D43EE6] px-6 text-sm font-bold text-white transition hover:opacity-90 shadow-md shadow-purple-200/50"
                  >
                    {studentStatus.etapas.EVALUACION_ENTREVISTA === "COMPLETADA"
                      ? "Ver Feedback"
                      : studentStatus.etapas.AGENDAMIENTO_ENTREVISTA === "COMPLETADA"
                      ? "Ver Cita"
                      : "Agendar entrevista"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-200 px-6 text-sm font-bold text-slate-400 cursor-not-allowed"
                  >
                    <Lock className="h-4 w-4" />
                    Bloqueado
                  </button>
                )}
              </div>
            </article>

          </div>
        </section>

      </main>
    </div>
  );
}
