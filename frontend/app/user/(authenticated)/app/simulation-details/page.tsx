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
}

export default function SimulationDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [entrevista, setEntrevista] = useState<Entrevista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      const data = await apiFetch<Entrevista | null>("/api/entrevistas/estudiante", {}, session?.backendJwt);
      setEntrevista(data);
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
        return date.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/20 text-slate-900 pb-16 font-sans">
      <main className="mx-auto w-full max-w-4xl px-4 py-8 md:py-10">
        
        {/* Back Link */}
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
            
            {/* Header del estado de la entrevista */}
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
                  {entrevista.estado === "Completada" ? "Evaluación Completada" : `Estado: ${entrevista.estado}`}
                </span>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-2">
                  Detalles de tu Simulación
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Reunión de simulación de entrevista laboral para retroalimentación
                </p>
              </div>

              {entrevista.estado === "Programada" && (
                <div className="flex gap-2">
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
                </div>
              )}
            </section>

            {/* Información Principal de la Cita */}
            <section className="grid gap-6 md:grid-cols-3">
              
              {/* Card de Mentor y Detalles */}
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

                {/* Si está completada, mostrar los comentarios de feedback */}
                {entrevista.estado === "Completada" && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-[#7447D7]" />
                      Retroalimentación General
                    </h3>
                    <div className="rounded-xl bg-slate-50 p-5 border border-slate-100 relative">
                      <span className="absolute -top-3 left-4 px-2 py-0.5 text-[10px] font-black uppercase bg-purple-100 text-[#7447D7] rounded-md tracking-wider">
                        Comentarios del Mentor
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed italic whitespace-pre-line mt-1">
                        "{entrevista.feedbackComentarios || "El mentor no dejó comentarios adicionales en su evaluación."}"
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* LADO DERECHO: Si está Completada: Resultados / Competencias. Si no: Tips de preparación */}
              <div className="space-y-6">
                
                {entrevista.estado === "Completada" ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Resultado Final</h3>
                      <p className="text-xs text-slate-400">Decisión de postulación recomendada</p>
                    </div>

                    <div className={`p-4 rounded-xl border text-center font-bold ${
                      entrevista.resultado === "APROBADO" || entrevista.resultado === "Aprobado"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : entrevista.resultado === "APROBADO_CON_OBSERVACIONES" || entrevista.resultado === "Aprobado con observaciones"
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}>
                      <Award className="h-8 w-8 mx-auto mb-2 opacity-80" />
                      <span className="text-md block tracking-wide uppercase">
                        {entrevista.resultado || "Aprobado"}
                      </span>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Calificación por Competencia
                      </span>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>Comunicación</span>
                            <span className="text-[#7447D7]">{entrevista.competenciaComunicacion || 5}/5</span>
                          </div>
                          {renderStars(entrevista.competenciaComunicacion)}
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>Habilidad Técnica</span>
                            <span className="text-[#7447D7]">{entrevista.competenciaTecnica || 5}/5</span>
                          </div>
                          {renderStars(entrevista.competenciaTecnica)}
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>Proactividad</span>
                            <span className="text-[#7447D7]">{entrevista.competenciaProactividad || 5}/5</span>
                          </div>
                          {renderStars(entrevista.competenciaProactividad)}
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>Resolución de Problemas</span>
                            <span className="text-[#7447D7]">{entrevista.competenciaResolucion || 5}/5</span>
                          </div>
                          {renderStars(entrevista.competenciaResolucion)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
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
                    </ul>
                  </div>
                )}

              </div>

            </section>

          </div>
        )}

      </main>
    </div>
  );
}
