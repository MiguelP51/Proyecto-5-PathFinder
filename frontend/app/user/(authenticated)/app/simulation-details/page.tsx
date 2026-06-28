"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Video,
  MapPin,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Star,
  Award,
  Sparkles,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface CompetenciaEvaluada {
  nombreCompetencia: string;
  nivelSeleccionado: number;
  descripcionNivel: string;
}

interface Entrevista {
  idEntrevista: number;
  idEstudiante: number;
  estudianteNombre: string;
  estudianteEmail: string;
  idMentor: number;
  mentorNombre: string;
  mentorEmail: string;
  fecha: string;
  hora: string;
  tipo: string;
  estado: string;
  virtualLink: string;
  discPerfilDominante: string;
  discNombrePerfil: string;
  cvAvailable: boolean;
  resultado: string;
  feedbackComentarios: string;
  competenciaComunicacion: number;
  competenciaTecnica: number;
  competenciaProactividad: number;
  competenciaResolucion: number;
  motivoCancelacion?: string;
  promedioCalificacion?: number;
  puesto?: string;
  competenciasEvaluadas?: CompetenciaEvaluada[];
  nombresCompetencias?: {
    competenciaComunicacion?: string;
    competenciaTecnica?: string;
    competenciaProactividad?: string;
    competenciaResolucion?: string;
  };
}

export default function SimulationDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [entrevista, setEntrevista] = useState<Entrevista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [surveyCompleted, setSurveyCompleted] = useState(true); // default true to avoid flicker

  const [canceling, setCanceling] = useState(false);
  const [showMotiveModal, setShowMotiveModal] = useState(false);
  const [motiveText, setMotiveText] = useState("");
  const [isRescheduleAction, setIsRescheduleAction] = useState(false);
  const [resetting, setResetting] = useState(false);

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
      router.push("/user/home");
    } catch (err) {
      console.error("Error al reiniciar progreso:", err);
      toast.error("No se pudo reiniciar el progreso de simulación.");
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.backendJwt) {
      loadEntrevista();
    }
  }, [status, session]);

  const loadEntrevista = async () => {
    try {
      setLoading(true);
      setError("");
      
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get("id");
      
      let data: Entrevista | null = null;
      if (idParam) {
        data = await apiFetch<Entrevista | null>(`/api/entrevistas/${idParam}`, {}, session?.backendJwt);
      } else {
        data = await apiFetch<Entrevista | null>("/api/entrevistas/estudiante", {}, session?.backendJwt);
      }
      
      setEntrevista(data);
      
      if (data && data.estado === "Completada") {
        try {
          const surveyData = await apiFetch<{ completada: boolean }>(`/api/encuestas/completada?idEntrevista=${data.idEntrevista}`, {}, session?.backendJwt);
          setSurveyCompleted(surveyData.completada);
        } catch (err) {
          console.error("Error checking survey status:", err);
        }
      }
    } catch (err) {
      console.error("Error cargando entrevista:", err);
      // Si el error es controlado (por ejemplo, sin entrevistas registradas), no mostramos alerta roja
      if (err instanceof Error && err.message.includes("No tienes entrevistas registradas")) {
        setEntrevista(null);
      } else {
        setError("No se pudieron cargar los detalles de la simulación de entrevista.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInterviewSubmit = async () => {
    if (!motiveText.trim()) {
      toast.warning("Por favor, ingresa el motivo antes de continuar.");
      return;
    }

    const actionText = isRescheduleAction ? "reagendar" : "cancelar";
    
    try {
      setCanceling(true);
      await apiFetch("/api/entrevistas/cancelar", {
        method: "POST",
        body: JSON.stringify({
          motivo: motiveText.trim(),
          esReagendado: isRescheduleAction
        })
      }, session?.backendJwt);

      toast.success(`Entrevista ${isRescheduleAction ? "cancelada para reagendación" : "cancelada con éxito"}.`);
      setShowMotiveModal(false);
      
      if (isRescheduleAction && entrevista) {
        router.push(`/user/app/simulation-schedule?mentorId=${entrevista.idMentor}`);
      } else {
        loadEntrevista();
      }
    } catch (err) {
      console.error(`Error al ${actionText} la entrevista:`, err);
      toast.error(err instanceof Error ? err.message : `Error al ${actionText} la entrevista.`);
    } finally {
      setCanceling(false);
    }
  };

  const renderStars = (rating: number) => {
    const safeRating = rating || 0;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= safeRating ? "fill-amber-400 text-amber-400" : "text-slate-200"
            }`}
          />
        ))}
      </div>
    );
  };

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

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#7447D7]" />
          <p className="text-slate-600 font-medium">Cargando detalles de tu simulación...</p>
        </div>
      </div>
    );
  }

  const isLessThan24Hours = (fechaStr: string, horaStr: string) => {
    try {
      const [year, month, day] = fechaStr.split("-").map(Number);
      const [hours, minutes] = horaStr.split(":").map(Number);
      const appointmentTime = new Date(year, month - 1, day, hours, minutes);
      const now = new Date();
      return (appointmentTime.getTime() - now.getTime()) < 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  };

  const disableActions = entrevista ? isLessThan24Hours(entrevista.fecha, entrevista.hora) : false;

  let parsedFeedback = {
    fortalezas: "",
    areasMejora: "",
    comentarios: entrevista?.feedbackComentarios || "",
    darFeedbackCv: false,
    feedbackCv: ""
  };

  if (entrevista?.feedbackComentarios) {
    try {
      const parsed = JSON.parse(entrevista.feedbackComentarios);
      if (parsed && typeof parsed === "object") {
        parsedFeedback.fortalezas = parsed.fortalezas || "";
        parsedFeedback.areasMejora = parsed.areasMejora || "";
        parsedFeedback.comentarios = parsed.comentarios || "";
        parsedFeedback.darFeedbackCv = !!parsed.darFeedbackCv;
        parsedFeedback.feedbackCv = parsed.feedbackCv || "";
      }
    } catch (e) {}
  }

  if (entrevista && entrevista.estado === "Completada") {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
        <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10 space-y-8">
          <Link 
            href="/user/home" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#7447D7] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel principal
          </Link>

          {!surveyCompleted && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-100 via-indigo-50 to-pink-50 border border-purple-200 shadow-md flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#7447D7] to-[#D43EE6] flex items-center justify-center text-white shadow-md flex-shrink-0 animate-pulse">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-md font-bold text-slate-800">
                    ¡Tu opinión es muy importante para nosotros!
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Por favor, tómate un minuto para responder nuestra encuesta de satisfacción sobre la simulación de entrevista.
                  </p>
                </div>
              </div>
              <Link
                href={`/user/app/survey?idEntrevista=${entrevista.idEntrevista}`}
                className="w-full sm:w-auto h-10 px-5 rounded-xl bg-gradient-to-r from-[#7447D7] to-[#D43EE6] hover:opacity-90 transition text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                Realizar Encuesta
              </Link>
            </div>
          )}

          <div className="bg-gradient-to-r from-[#0E3E66] to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-lg space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/30 inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Retroalimentación Disponible
                </span>
                <h1 className="text-2xl md:text-3xl font-black mt-3">Resultados de tu Simulación</h1>
                <p className="text-indigo-200 text-sm mt-1">
                  Simulación de entrevista completada con éxito. Revisa el feedback detallado de tu mentor.
                </p>
              </div>
              <button
                onClick={handleResetProgress}
                disabled={resetting}
                className="self-start md:self-center h-11 px-6 rounded-xl bg-white hover:bg-slate-100 text-[#0E3E66] font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-black/10 cursor-pointer"
              >
                {resetting ? "Reiniciando..." : "Iniciar Nuevo Proceso"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div>
                <span className="text-xs text-indigo-300 block font-bold uppercase tracking-wider">Tu PathMentor</span>
                <span className="font-extrabold text-white block mt-0.5">{entrevista.mentorNombre}</span>
                <span className="text-xs text-indigo-200 block">{entrevista.mentorEmail}</span>
              </div>
              <div>
                <span className="text-xs text-indigo-300 block font-bold uppercase tracking-wider">Fecha y Hora</span>
                <span className="font-extrabold text-white block mt-0.5">{formatFecha(entrevista.fecha)}</span>
                <span className="text-xs text-indigo-200 block">{entrevista.hora} hs</span>
              </div>
              <div>
                <span className="text-xs text-indigo-300 block font-bold uppercase tracking-wider">Puesto de Simulación</span>
                <span className="font-extrabold text-white block mt-0.5">{entrevista.puesto || "Sin especificar"}</span>
              </div>
              <div>
                <span className="text-xs text-indigo-300 block font-bold uppercase tracking-wider">Modalidad</span>
                <span className="font-extrabold text-white block mt-0.5 capitalize">{entrevista.tipo}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 text-center">
              <div>
                <h3 className="text-base font-black text-slate-800">Resultado General</h3>
                <p className="text-xs text-slate-400 mt-0.5">Calificación y decisión final</p>
              </div>

              <div className="py-6 border-y border-slate-100 flex flex-col items-center justify-center gap-4">
                <div className="h-28 w-28 rounded-full border-4 border-purple-100 flex flex-col items-center justify-center mx-auto">
                  <span className="text-2xl font-black text-[#7447D7]">{(entrevista.promedioCalificacion || 0.0).toFixed(1)}/5</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase">
                    {entrevista.competenciasEvaluadas && entrevista.competenciasEvaluadas.length > 0 ? "Nivel Promedio" : "Calificación"}
                  </span>
                </div>

                <div className={`px-4 py-2 rounded-xl border text-xs font-black tracking-wide uppercase ${
                  entrevista.resultado === "Alta"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : entrevista.resultado === "Media"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}>
                  {entrevista.resultado === "Alta" ? "Alta probabilidad" :
                   entrevista.resultado === "Media" ? "Media probabilidad" :
                   entrevista.resultado === "Baja" ? "Baja probabilidad" :
                   (entrevista.resultado || "Alta probabilidad")}
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                La calificación refleja el promedio de tu desempeño en las competencias clave evaluadas por el mentor.
              </p>
            </div>

            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-800">Calificación Detallada por Competencia</h3>
                <p className="text-xs text-slate-400 mt-0.5">Rúbrica oficial y nivel alcanzado</p>
              </div>

              <div className="space-y-4">
                {entrevista.competenciasEvaluadas && entrevista.competenciasEvaluadas.length > 0 ? (
                  entrevista.competenciasEvaluadas.map((comp, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs font-black text-slate-800">
                        <span className="font-extrabold text-sm">{comp.nombreCompetencia}</span>
                        <span className="text-[#7447D7] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">Nivel {comp.nivelSeleccionado} / 3</span>
                      </div>
                      
                      <div className="flex gap-1 h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                        {[1, 2, 3].map((lvl) => (
                          <div
                            key={lvl}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              lvl <= comp.nivelSeleccionado
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed italic pt-1">
                        <span className="font-bold text-[#7447D7]">
                          {comp.nivelSeleccionado === 0 ? "Nivel 0 (Bajo lo esperado): " :
                           comp.nivelSeleccionado === 1 ? "Nivel 1 (Mínimo): " :
                           comp.nivelSeleccionado === 2 ? "Nivel 2 (Supera Mínimo): " :
                           "Nivel 3 (Excelente): "}
                        </span>
                        {comp.descripcionNivel || "Sin descripción disponible."}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-slate-100 p-4 rounded-2xl space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{entrevista.nombresCompetencias?.competenciaComunicacion || "Comunicación"}</span>
                        <span className="text-[#7447D7]">{entrevista.competenciaComunicacion || 5}/5</span>
                      </div>
                      {renderStars(entrevista.competenciaComunicacion)}
                    </div>

                    <div className="border border-slate-100 p-4 rounded-2xl space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{entrevista.nombresCompetencias?.competenciaTecnica || "Habilidad Técnica"}</span>
                        <span className="text-[#7447D7]">{entrevista.competenciaTecnica || 5}/5</span>
                      </div>
                      {renderStars(entrevista.competenciaTecnica)}
                    </div>

                    <div className="border border-slate-100 p-4 rounded-2xl space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{entrevista.nombresCompetencias?.competenciaProactividad || "Proactividad"}</span>
                        <span className="text-[#7447D7]">{entrevista.competenciaProactividad || 5}/5</span>
                      </div>
                      {renderStars(entrevista.competenciaProactividad)}
                    </div>

                    <div className="border border-slate-100 p-4 rounded-2xl space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{entrevista.nombresCompetencias?.competenciaResolucion || "Resolución de Problemas"}</span>
                        <span className="text-[#7447D7]">{entrevista.competenciaResolucion || 5}/5</span>
                      </div>
                      {renderStars(entrevista.competenciaResolucion)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Retroalimentación General del Mentor
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Observaciones redactadas tras la entrevista</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {parsedFeedback.fortalezas && (
                <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-5 space-y-2.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold">
                    💪 Fortalezas Clave
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                    {parsedFeedback.fortalezas}
                  </p>
                </div>
              )}

              {parsedFeedback.areasMejora && (
                <div className="bg-amber-50/30 border border-amber-100 rounded-2xl p-5 space-y-2.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-bold">
                    📈 Áreas de Mejora
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                    {parsedFeedback.areasMejora}
                  </p>
                </div>
              )}
            </div>

            {parsedFeedback.comentarios && (
              <div className="bg-purple-50/20 border border-purple-100 rounded-2xl p-6 space-y-2.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-800 px-3 py-1 text-xs font-bold">
                  💬 Comentarios Adicionales
                </span>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line italic font-medium">
                  &ldquo;{parsedFeedback.comentarios}&rdquo;
                </p>
              </div>
            )}
          </div>

          {parsedFeedback.darFeedbackCv && parsedFeedback.feedbackCv && (
            <div className="bg-gradient-to-r from-blue-50/40 via-indigo-50/10 to-purple-50/30 rounded-3xl p-6 md:p-8 border border-indigo-100 shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Award className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-indigo-900">Retroalimentación Dedicada sobre tu CV</h3>
                  <p className="text-xs text-indigo-400 mt-0.5 font-bold">Revisión de estructura, redacción y contenido por tu mentor</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-indigo-100/60 shadow-xs">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                  {parsedFeedback.feedbackCv}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/20 text-slate-900 pb-16 font-sans">
      <main className="mx-auto w-full max-w-4xl px-4 py-8 md:py-10">
        
        <Link 
          href="/user/home" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#7447D7] transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel principal
        </Link>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        {!entrevista ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No tienes entrevistas agendadas</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Aún no has programado tu simulación de entrevista con un PathMentor.
            </p>
            <Link
              href="/user/app/simulation-intro"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7447D7] to-[#D43EE6] px-6 text-sm font-bold text-white transition hover:opacity-90 shadow-md shadow-purple-200/50"
            >
              Agendar una entrevista
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            
            {entrevista.estado === "Completada" && !surveyCompleted && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-100 via-indigo-50 to-pink-50 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800/50 shadow-md shadow-purple-100/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#7447D7] to-[#D43EE6] flex items-center justify-center text-white shadow-md shadow-purple-200/50 flex-shrink-0 animate-pulse">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-md font-bold text-slate-800 dark:text-slate-100">
                      ¡Tu opinión es muy importante para nosotros!
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Por favor, tómate un minuto para responder nuestra encuesta de satisfacción sobre la simulación de entrevista.
                    </p>
                  </div>
                </div>
                <Link
                  href={`/user/app/survey?idEntrevista=${entrevista.idEntrevista}`}
                  className="w-full sm:w-auto h-10 px-5 rounded-xl bg-gradient-to-r from-[#7447D7] to-[#D43EE6] hover:opacity-90 transition text-xs font-bold text-white shadow-md shadow-purple-200/30 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  Realizar Encuesta
                </Link>
              </div>
            )}

            <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                  entrevista.estado === "Completada"
                    ? "bg-emerald-100 text-emerald-800"
                    : entrevista.estado === "Cancelada"
                    ? "bg-red-100 text-red-800"
                    : "bg-purple-100 text-[#7447D7]"
                }`}>
                  {entrevista.estado === "Completada" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 animate-pulse" />
                  )}
                  {entrevista.estado === "Completada" ? "Retroalimentación Disponible" : `Estado: ${entrevista.estado}`}
                </span>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-2">
                  Detalles de tu Simulación
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Reunión de simulación de entrevista laboral para retroalimentación
                </p>
              </div>

              {entrevista.estado === "Programada" && (
                <div className="flex flex-col items-end gap-2">
                  <div className="flex flex-wrap gap-2 items-center">
                    {entrevista.tipo === "virtual" && entrevista.virtualLink ? (
                      <a
                        href={entrevista.virtualLink.startsWith("http") ? entrevista.virtualLink : `https://${entrevista.virtualLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7447D7] to-[#D43EE6] px-6 text-sm font-bold text-white transition hover:opacity-95 shadow-md shadow-purple-200/30 cursor-pointer"
                      >
                        <Video className="h-4 w-4" />
                        Unirse a la Reunión
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <button
                        disabled
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-6 text-sm font-bold text-slate-400 cursor-not-allowed"
                      >
                        <Video className="h-4 w-4" />
                        Enlace Pendiente
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsRescheduleAction(true);
                        setMotiveText("");
                        setShowMotiveModal(true);
                      }}
                      disabled={canceling || disableActions}
                      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#7447D7] text-[#7447D7] hover:bg-purple-50 px-6 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                        !disableActions ? "animate-pulse" : ""
                      }`}
                    >
                      Reagendar Cita
                    </button>

                    <button
                      onClick={() => {
                        setIsRescheduleAction(false);
                        setMotiveText("");
                        setShowMotiveModal(true);
                      }}
                      disabled={canceling || disableActions}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 px-6 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Cancelar Cita
                    </button>
                  </div>
                  {disableActions && (
                    <p className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mt-1">
                      ⚠️ Ya no puedes reagendar ni cancelar la cita (límite de 24 horas antes del evento).
                    </p>
                  )}
                </div>
              )}
            </section>

            <section className="grid gap-6 md:grid-cols-3">
              
              <div className="md:col-span-2 space-y-6">
                
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#7447D7]" />
                    Información de la Reunión
                  </h3>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex gap-3 items-start">
                      <User className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Tu PathMentor</span>
                        <span className="font-bold text-slate-700">{entrevista.mentorNombre}</span>
                        <span className="text-xs text-slate-500 block mt-0.5">{entrevista.mentorEmail}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <CalendarIcon className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Fecha de la Cita</span>
                        <span className="font-bold text-slate-700">{formatFecha(entrevista.fecha)}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <Clock className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Horario</span>
                        <span className="font-bold text-slate-700">{entrevista.hora} hs (60 min)</span>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      {entrevista.tipo === "virtual" ? (
                        <Video className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <MapPin className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Modalidad</span>
                        <span className="font-bold text-slate-700 capitalize">{entrevista.tipo}</span>
                      </div>
                    </div>

                    {entrevista.puesto && (
                      <div className="flex gap-3 items-start sm:col-span-2 border-t border-slate-100 pt-4">
                        <Award className="h-5 w-5 text-[#7447D7] mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Puesto Postulado</span>
                          <span className="font-bold text-slate-700">{entrevista.puesto}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {entrevista.estado === "Programada" && entrevista.tipo === "virtual" && (
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      {entrevista.virtualLink ? (
                        <div className="rounded-xl bg-purple-50/50 border border-purple-100 p-4">
                          <p className="text-xs text-purple-700 font-bold uppercase tracking-wider mb-1">Enlace de acceso rápido</p>
                          <a 
                            href={entrevista.virtualLink.startsWith("http") ? entrevista.virtualLink : `https://${entrevista.virtualLink}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm font-bold text-[#7447D7] hover:underline flex items-center gap-1.5 break-all"
                          >
                            {entrevista.virtualLink}
                            <ExternalLink className="h-3.5 w-3.5 inline flex-shrink-0" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-200">
                          * El mentor agregará el enlace de la reunión próximamente. Te llegará una notificación por correo electrónico automáticamente cuando se registre.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-purple-100 bg-purple-50/20 p-6 space-y-4 shadow-sm">
                  <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#7447D7] animate-pulse" />
                    ¿Cómo prepararte?
                  </h3>
                  <ul className="text-xs space-y-3 text-slate-600 leading-relaxed list-disc list-inside">
                    <li><strong>Revisa tu perfil DISC:</strong> Identifica tus fortalezas de comportamiento y cómo comunicarlas efectivamente.</li>
                    <li><strong>Consolida tu CV:</strong> Mantén listos tus estudios y experiencia laboral a la mano.</li>
                    <li><strong>Sé puntual:</strong> Te aconsejamos ingresar al enlace de reunión 5 minutos antes.</li>
                    <li><strong>Prepárate técnicamente:</strong> Revisa tu audio, cámara y conexión a internet estable.</li>
                    <li><strong>Revisa tu perfil de comportamiento DISC antes de la sesión.</strong></li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {showMotiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800">
              {isRescheduleAction ? "Motivo de Reagendación" : "Motivo de Cancelación"}
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Por favor, indica brevemente por qué deseas {isRescheduleAction ? "reagendar" : "cancelar"} tu cita. Esta información será compartida con tu PathMentor.
            </p>
            <textarea
              className="w-full h-32 mt-4 p-4 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#7447D7] bg-slate-50 text-slate-800 resize-none"
              placeholder="Escribe el motivo aquí..."
              value={motiveText}
              onChange={(e) => setMotiveText(e.target.value)}
            />
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowMotiveModal(false)}
                className="px-5 h-11 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Volver
              </button>
              <button
                onClick={handleCancelInterviewSubmit}
                disabled={canceling}
                className="px-5 h-11 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-[#7447D7] to-[#D43EE6] hover:opacity-95 transition shadow-lg shadow-purple-200/50 disabled:opacity-50 cursor-pointer flex items-center justify-center"
              >
                {canceling ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
