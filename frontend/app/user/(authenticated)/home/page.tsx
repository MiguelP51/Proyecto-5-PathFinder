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
  Award,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import SatisfactionSurveyTrigger from "@/components/surveys/SatisfactionSurveyTrigger";


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
  exploracionIniciada?: boolean;
}

const formatFecha = (fechaStr: string) => {
  try {
    const parts = fechaStr.split("-");
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const formatted = date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    return fechaStr;
  } catch {
    return fechaStr;
  }
};

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [studentStatus, setStudentStatus] = useState<EstadoEstudianteResponse | null>(null);
  const [activeInterview, setActiveInterview] = useState<any | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);
  const [hasLocalProgress, setHasLocalProgress] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelMotive, setCancelMotive] = useState("");
  const [canceling, setCanceling] = useState(false);
  const [confirmingReprogram, setConfirmingReprogram] = useState(false);

  const handleResetProgress = async () => {
    const confirmReset = window.confirm(
      "¿Estás seguro de que deseas iniciar una nueva simulación? Esto archivará tu entrevista actual y reiniciará tus etapas de CV y preparación, pero conservarás tus resultados del test DISC."
    );
    if (!confirmReset) return;

    try {
      setResetting(true);
      await apiFetch("/api/profile/reset", {
        method: "POST",
      }, session?.backendJwt);
      
      toast.success("¡Tu progreso de simulación ha sido reiniciado! Ahora puedes iniciar de nuevo.");
      loadStudentStatus();
    } catch (err) {
      console.error("Error al reiniciar progreso:", err);
      toast.error("No se pudo reiniciar el progreso de simulación.");
    } finally {
      setResetting(false);
    }
  };

  const handleConfirmReprogram = async () => {
    if (!activeInterview) return;
    try {
      setConfirmingReprogram(true);
      await apiFetch<any>(
        `/api/entrevistas/${activeInterview.idEntrevista}/confirmar-reprogramacion`,
        { method: "PUT" },
        session?.backendJwt
      );
      toast.success("¡Nueva fecha confirmada correctamente!");
      loadStudentStatus();
    } catch (err) {
      console.error("Error al confirmar reprogramacion:", err);
      toast.error("No se pudo confirmar la nueva fecha.");
    } finally {
      setConfirmingReprogram(false);
    }
  };

  const handleCancelInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelMotive.trim()) {
      toast.error("Por favor, ingresa un motivo para la cancelación.");
      return;
    }
    try {
      setCanceling(true);
      await apiFetch<any>(
        "/api/entrevistas/cancelar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            motivo: cancelMotive,
            esReagendado: false,
          }),
        },
        session?.backendJwt
      );
      toast.success("Entrevista cancelada exitosamente.");
      setShowCancelModal(false);
      setCancelMotive("");
      loadStudentStatus();
    } catch (err) {
      console.error("Error al cancelar entrevista:", err);
      toast.error("No se pudo cancelar la entrevista.");
    } finally {
      setCanceling(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.backendJwt) {
      loadStudentStatus();
    }
  }, [status, session]);

  useEffect(() => {
    if (session?.user?.email) {
      const savedAnswers = localStorage.getItem(`disc_answers_${session.user.email}`);
      if (savedAnswers) {
        try {
          const parsed = JSON.parse(savedAnswers);
          if (parsed && Object.keys(parsed).length > 0) {
            setHasLocalProgress(true);
          }
        } catch (e) {
          console.error("Error parsing saved DISC answers:", e);
        }
      }
    }
  }, [session]);

  const loadStudentStatus = async () => {
    try {
      setLoading(true);
      setError("");

      try {
        const userRes = await apiFetch<any>("/api/users/me", {}, session?.backendJwt);
        setUserData(userRes);
      } catch (err) {
        console.error("Error loading user profile name:", err);
      }

      const data = await apiFetch<EstadoEstudianteResponse>(
        "/api/users/me/status",
        { next: { revalidate: 0 } } as any,
        session?.backendJwt
      );
      setStudentStatus(data);

      if (data?.etapas?.EVALUACION_ENTREVISTA === "COMPLETADA") {
        router.replace("/user/app/exploracion/dashboard");
        return;
      }

      // Cargar entrevista activa si está en etapa de agendamiento o posterior
      let currentActiveId: number | null = null;
      try {
        const interviewData = await apiFetch<any>(
          "/api/entrevistas/estudiante",
          {},
          session?.backendJwt
        );
        setActiveInterview(interviewData);
        if (interviewData) {
          currentActiveId = interviewData.idEntrevista;
        }
      } catch (err) {
        console.log("No se pudo cargar la entrevista activa del estudiante:", err);
      }

      // Cargar historial
      try {
        const historyData = await apiFetch<any[]>(
          "/api/entrevistas/estudiante/historial",
          {},
          session?.backendJwt
        );
        const completedHistory = (historyData || []).filter(
          (e: any) => e.estado === "Completada" && e.idEntrevista !== currentActiveId
        );
        setHistory(completedHistory);
      } catch (err) {
        console.error("Error cargando historial de entrevistas:", err);
      }
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
              ¡Hola, {userData?.name || session?.user?.name || "Estudiante"}! 👋
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

        {/* Banner de Carga/Exploracion si la entrevista esta completada */}
        {studentStatus?.etapas?.EVALUACION_ENTREVISTA === "COMPLETADA" && (
          <div className="mb-8 rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-100 via-indigo-50 to-pink-50 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-pink-950/20 p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7447D7] to-[#D43EE6] text-white shadow-lg shadow-purple-200/50">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#7447D7] block font-extrabold">¡PREPARACIÓN COMPLETADA!</span>
                <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                  Has completado exitosamente todas las etapas de tu preparación de perfil.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Tu perfil y simulación de entrevista ya cuentan con la retroalimentación de tu PathMentor. Ya puedes ingresar al Módulo de Exploración Laboral para buscar tus áreas y retos de interés.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
              <Link
                href={studentStatus.exploracionIniciada ? "/user/app/exploracion/dashboard" : "/user/app/exploracion-intro"}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#7447D7] to-[#D43EE6] hover:opacity-95 text-white text-xs font-bold px-6 transition shadow-md shadow-purple-200/30 cursor-pointer text-center whitespace-nowrap"
              >
                Ir a Exploración Laboral
              </Link>
              <button
                onClick={handleResetProgress}
                disabled={resetting}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-[#7447D7] disabled:opacity-50 text-xs font-bold px-6 transition cursor-pointer text-center whitespace-nowrap"
              >
                {resetting ? "Reiniciando..." : "Iniciar Nueva Simulación"}
              </button>
            </div>
          </div>
        )}

        {/* Anuncios de Entrevista */}
        {activeInterview && activeInterview.estado === "Reagendada" && (
          <div className="mb-8 rounded-3xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 animate-pulse">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 block">CITA REAGENDADA POR EL MENTOR</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  Tu mentor <span className="text-[#7447D7]">{activeInterview.mentorNombre}</span> ha propuesto una nueva fecha para la entrevista.
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Nueva fecha propuesta: <span className="font-semibold">{formatFecha(activeInterview.fecha)}</span> a las <span className="font-semibold">{activeInterview.hora} hs</span>.
                </p>
                <p className="text-xs font-semibold text-amber-700 mt-2">
                  Por favor, confirma si estás de acuerdo con este cambio o selecciona otra opción.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleConfirmReprogram}
                disabled={confirmingReprogram}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:opacity-95 text-white text-xs font-bold px-4 transition shadow-sm cursor-pointer"
              >
                {confirmingReprogram ? "Confirmando..." : "Aceptar nueva fecha"}
              </button>
              <Link
                href="/user/app/simulation-schedule"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-white border border-slate-200 hover:border-amber-300 text-xs font-bold text-slate-700 px-4 transition cursor-pointer"
              >
                Reprogramar cita
              </Link>
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 transition cursor-pointer"
              >
                Cancelar cita
              </button>
            </div>
          </div>
        )}

        {activeInterview && activeInterview.estado === "Programada" && !activeInterview.virtualLink && (
          <div className="mb-8 rounded-3xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 animate-pulse">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 block">ANUNCIO: ENTREVISTA AGENDADA</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  Tienes una entrevista programada con <span className="text-[#7447D7]">{activeInterview.mentorNombre}</span>.
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Fecha: <span className="font-semibold">{formatFecha(activeInterview.fecha)}</span> a las <span className="font-semibold">{activeInterview.hora} hs</span> ({activeInterview.tipo === "virtual" ? "Virtual" : "Presencial"}).
                </p>
                <p className="text-xs font-semibold text-amber-600 mt-2 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  El mentor confirmará el enlace de la reunión virtual próximamente.
                </p>
              </div>
            </div>
            <Link
              href="/user/app/simulation-details"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-white border border-slate-200 hover:border-amber-300 text-xs font-bold text-slate-700 hover:text-amber-800 px-5 transition flex-shrink-0 cursor-pointer"
            >
              Ver detalles
            </Link>
          </div>
        )}

        {activeInterview && activeInterview.estado === "Programada" && activeInterview.virtualLink && (
          <div className="mb-8 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 animate-pulse">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block">ANUNCIO: ENLACE LISTO</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  ¡El enlace de tu entrevista con <span className="text-[#7447D7]">{activeInterview.mentorNombre}</span> ya está disponible!
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Fecha: <span className="font-semibold">{formatFecha(activeInterview.fecha)}</span> a las <span className="font-semibold">{activeInterview.hora} hs</span>.
                </p>
                <p className="text-xs font-semibold text-emerald-700 mt-2">
                  Haz clic en el botón de la derecha para unirte directamente a la simulación.
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <a
                href={activeInterview.virtualLink.startsWith("http") ? activeInterview.virtualLink : `https://${activeInterview.virtualLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white text-xs font-bold px-5 transition shadow-sm shadow-emerald-100 cursor-pointer"
              >
                Unirse a la Reunión
              </a>
              <Link
                href="/user/app/simulation-details"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-700 px-4 transition cursor-pointer"
              >
                Ver detalles
              </Link>
            </div>
          </div>
        )}

        {activeInterview && activeInterview.estado === "Completada" && (
          <div className="mb-8 rounded-3xl border border-purple-200 bg-purple-50/40 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-[#7447D7]">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#7447D7] block">ANUNCIO: RETROALIMENTACIÓN DISPONIBLE</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  ¡Tu mentor <span className="text-[#7447D7]">{activeInterview.mentorNombre}</span> ha publicado la retroalimentación de tu entrevista!
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Resultado recomendado: <span className="font-bold text-purple-700 uppercase">{activeInterview.resultado}</span>
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Revisa el detalle de tus calificaciones y competencias haciendo clic a la derecha.
                </p>
              </div>
            </div>
            <Link
              href="/user/app/simulation-details"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#7447D7] to-[#D43EE6] hover:opacity-95 text-white text-xs font-bold px-5 transition shadow-md shadow-purple-100 flex-shrink-0 cursor-pointer"
            >
              Ver Feedback
            </Link>
          </div>
        )}

        {/* Progreso General */}
        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Proceso de enrolamiento</h2>
            <span className="text-2xl font-black text-[#7447D7]">{progressPercent}%</span>
          </div>
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7447D7] via-[#B412F0] to-[#D43EE6] transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Completa las 3 etapas de tu proceso de enrolamiento para estar listo y postular a tu primera experiencia laboral formal.
          </p>
          <div className="mt-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100/60 text-xs text-slate-600 leading-relaxed space-y-2">
            <p className="font-bold text-slate-800">¿Qué pasa al finalizar el enrolamiento?</p>
            <p>
              Una vez completes tu entrevista y tu PathMentor envíe su retroalimentación, se desbloquearán las siguientes secciones:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>SkillPaths:</strong> Rutas de aprendizaje personalizadas para dominar y certificar tus competencias clave.</li>
              <li><strong>PathChallenges:</strong> Retos prácticos reales de negocio inspirados en casos reales para poner a prueba tus habilidades.</li>
            </ul>
          </div>
        </section>

        {/* Tareas Pendientes y Activas */}
        <section className="mb-10">
          <h2 className="text-xl font-extrabold text-slate-800 mb-6">Tareas Pendientes y Activas</h2>
          <div className="grid gap-6 md:grid-cols-3">
            
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
                    <h3 className="text-lg font-bold text-slate-855">Registro y Perfil</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      Completa tu información personal, académica, experiencia y sube tu CV redactado.
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
                  {step1Completed ? "Ver Perfil" : "Completar"}
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
                    <h3 className="text-lg font-bold text-slate-855">Prueba DISC</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      Descubre tu perfil conductual bajo 4 dimensiones clave para encontrar tu mejor ajuste laboral.
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
                    {hasLocalProgress ? "Continuar" : "Iniciar"}
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

            {/* Paso 3: Entrevista con PathMentor */}
            <article className={`relative rounded-3xl border p-6 shadow-sm flex flex-col justify-between transition duration-300 ${
              studentStatus.etapas.EVALUACION_ENTREVISTA === "COMPLETADA"
                ? "border-emerald-200 bg-emerald-50/10 hover:shadow-md"
                : step3Active 
                ? "border-purple-200 bg-white ring-1 ring-purple-100 hover:shadow-md" 
                : "border-slate-200 bg-slate-100/50 opacity-60"
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    studentStatus.etapas.EVALUACION_ENTREVISTA === "COMPLETADA"
                      ? "bg-emerald-100 text-emerald-800"
                      : studentStatus.etapas.AGENDAMIENTO_ENTREVISTA === "COMPLETADA"
                      ? "bg-blue-100 text-blue-800"
                      : step3Active
                      ? "bg-purple-100 text-[#7447D7]"
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    {studentStatus.etapas.EVALUACION_ENTREVISTA === "COMPLETADA" ? <CheckCircle2 className="h-3.5 w-3.5" /> : !step3Active ? <Lock className="h-3.5 w-3.5" /> : null}
                    Paso 3
                  </span>
                  <span className={`text-xs font-semibold ${
                    studentStatus.etapas.EVALUACION_ENTREVISTA === "COMPLETADA"
                      ? "text-emerald-700"
                      : studentStatus.etapas.AGENDAMIENTO_ENTREVISTA === "COMPLETADA"
                      ? "text-blue-700"
                      : step3Active
                      ? "text-purple-700"
                      : "text-slate-500"
                  }`}>
                    {studentStatus.etapas.EVALUACION_ENTREVISTA === "COMPLETADA"
                      ? "Completado"
                      : studentStatus.etapas.AGENDAMIENTO_ENTREVISTA === "COMPLETADA"
                      ? "Agendada"
                      : step3Active
                      ? "Disponible"
                      : "Bloqueado"}
                  </span>
                </div>
                <div className="flex gap-4">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
                    studentStatus.etapas.EVALUACION_ENTREVISTA === "COMPLETADA"
                      ? "bg-emerald-100 text-emerald-600"
                      : studentStatus.etapas.AGENDAMIENTO_ENTREVISTA === "COMPLETADA"
                      ? "bg-blue-100 text-blue-600"
                      : step3Active
                      ? "bg-purple-100 text-[#7447D7]"
                      : "bg-slate-200 text-slate-400"
                  }`}>
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-855">Entrevista Mentor</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-505">
                      Agenda y realiza una simulación de entrevista con tu mentor para perfeccionar tu perfil y respuestas.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
                {step3Active ? (
                  <Link
                    href={
                      studentStatus.etapas.AGENDAMIENTO_ENTREVISTA === "COMPLETADA"
                        ? "/user/app/simulation-details"
                        : "/user/app/simulation-intro"
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7447D7] to-[#D43EE6] px-5 text-sm font-bold text-white transition hover:opacity-90 shadow-md shadow-purple-200/50"
                  >
                    {studentStatus.etapas.EVALUACION_ENTREVISTA === "COMPLETADA"
                      ? "Ver Feedback"
                      : studentStatus.etapas.AGENDAMIENTO_ENTREVISTA === "COMPLETADA"
                      ? "Ver Cita"
                      : "Agendar"}
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

        {/* Sección de Re-enrolamiento */}
        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">¿Deseas reiniciar tu simulación?</h2>
              <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                Si deseas volver a cargar tu CV o realizar una nueva simulación desde cero para mejorar tus resultados, puedes reiniciar tu progreso. Nota: Se archivarán tus entrevistas previas, pero mantendrás tus resultados del test DISC.
              </p>
            </div>
            <button
              onClick={handleResetProgress}
              disabled={resetting}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:opacity-95 text-white disabled:opacity-50 text-xs font-bold px-6 transition shadow-md cursor-pointer whitespace-nowrap"
            >
              {resetting ? "Reiniciando..." : "Iniciar Nueva Simulación"}
            </button>
          </div>
        </section>

        {/* Historial de Simulaciones Anteriores */}
        {history.length > 0 && (
          <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-800 mb-4">Historial de Simulaciones Anteriores</h2>
            <p className="text-xs text-slate-500 mb-4">
              Consulta las retroalimentaciones y observaciones que recibiste en tus simulaciones de entrevistas pasadas.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Mentor</th>
                    <th className="py-3 px-4">Puesto</th>
                    <th className="py-3 px-4">Resultado</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((h) => (
                    <tr key={h.idEntrevista} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{formatFecha(h.fecha)}</td>
                      <td className="py-3.5 px-4 font-semibold">{h.mentorNombre}</td>
                      <td className="py-3.5 px-4 font-semibold">{h.puesto || "General"}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 uppercase">
                          {h.resultado || "Completada"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedHistoryItem(h);
                            setShowHistoryModal(true);
                          }}
                          className="text-xs font-bold text-[#7447D7] hover:underline cursor-pointer"
                        >
                          Ver Informe
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>

      {/* MODAL: HISTORIAL DE FEEDBACK */}
      {showHistoryModal && selectedHistoryItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200 flex flex-col p-6 relative">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => { setShowHistoryModal(false); setSelectedHistoryItem(null); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100 space-y-1">
                <span className="text-[10px] font-black uppercase text-[#7447D7] tracking-wider block">Informe de Retroalimentación Histórico</span>
                <h3 className="text-xl font-black text-slate-900">
                  Simulación del {formatFecha(selectedHistoryItem.fecha)}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Mentor: {selectedHistoryItem.mentorNombre} | Puesto: {selectedHistoryItem.puesto || "General"}
                </p>
              </div>

              {/* Competencias - 100% Ancho al inicio */}
              <div className="rounded-2xl border border-purple-100 bg-purple-50/20 p-5 space-y-4">
                <h4 className="text-xs font-black text-[#7447D7] uppercase tracking-wider">Desempeño por Competencias</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: "Comunicación", score: selectedHistoryItem.competenciaComunicacion },
                    { label: "Competencia Técnica / Razonamiento", score: selectedHistoryItem.competenciaTecnica },
                    { label: "Proactividad e Iniciativa", score: selectedHistoryItem.competenciaProactividad },
                    { label: "Resolución de Problemas", score: selectedHistoryItem.competenciaResolucion },
                  ].map((comp, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{comp.label}</span>
                        <span className="text-[#7447D7]">{comp.score}/5</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#7447D7] to-[#D43EE6] rounded-full"
                          style={{ width: `${((comp.score || 0) / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedHistoryItem.resultado && (
                  <div className="pt-4 border-t border-purple-100/30 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Probabilidad de éxito en postulación recomendada:</span>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 bg-purple-100 text-[#7447D7] uppercase">
                      {selectedHistoryItem.resultado}
                    </span>
                  </div>
                )}
              </div>

              {/* Comentarios del Mentor */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Comentarios y Observaciones del Mentor</h4>
                <p className="text-xs leading-relaxed font-semibold italic bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-600">
                  &ldquo;{selectedHistoryItem.feedbackComentarios || "Sin comentarios adicionales."}&rdquo;
                </p>
              </div>

              {/* Competencias Detalladas */}
              {selectedHistoryItem.competenciasEvaluadas && selectedHistoryItem.competenciasEvaluadas.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Desglose Detallado</h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {selectedHistoryItem.competenciasEvaluadas.map((comp: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/40 text-xs font-semibold space-y-1">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{comp.nombreCompetencia}</span>
                          <span className="text-[#7447D7]">Nivel {comp.nivelSeleccionado}</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed font-medium">{comp.descripcionNivel}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setShowHistoryModal(false); setSelectedHistoryItem(null); }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: CANCELAR CITA */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 p-6 relative">
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <form onSubmit={handleCancelInterviewSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Cancelar Cita</h3>
                <p className="text-xs text-slate-500">
                  Por favor, indica el motivo por el cual necesitas cancelar tu entrevista. Esto notificará a tu mentor.
                </p>
              </div>

              <textarea
                value={cancelMotive}
                onChange={(e) => setCancelMotive(e.target.value)}
                placeholder="Escribe el motivo aquí..."
                rows={4}
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-[#7447D7] focus:outline-none"
                required
              />

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                >
                  Regresar
                </button>
                <button
                  type="submit"
                  disabled={canceling}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {canceling ? "Cancelando..." : "Confirmar Cancelación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRIGGER ENCUESTA SATISFACCION */}
      <SatisfactionSurveyTrigger isCompleted={studentStatus?.etapas?.EVALUACION_ENTREVISTA === "COMPLETADA"} />

    </div>
  );
}
