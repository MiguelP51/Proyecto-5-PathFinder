"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import {
  MessageSquare,
  Star,
  Calendar,
  Briefcase,
  Loader2,
  AlertCircle,
  HelpCircle,
  ThumbsUp,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";

interface FeedbackItem {
  idEntrevista: number;
  fecha: string;
  puestoInteres: string;
  respuestas: {
    textoPregunta: string;
    tipoPregunta: string;
    valorEntero?: number | null;
    valorTexto?: string | null;
  }[];
}

export default function StudentFeedbackPage() {
  const { data: session, status } = useSession();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    if (status === "authenticated" && session?.backendJwt) {
      loadFeedbacks();
    }
  }, [status, session]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch<FeedbackItem[]>("/api/encuestas/mentor", {}, session?.backendJwt);
      setFeedbacks(data || []);
    } catch (err) {
      console.error("Error loading student feedbacks:", err);
      setError("No se pudo cargar la retroalimentación de los alumnos.");
    } finally {
      setLoading(false);
    }
  };

  const getQuestionAverage = (questionText: string) => {
    const ratings = feedbacks
      .flatMap((f) => f.respuestas)
      .filter((r) => r.textoPregunta.toLowerCase().includes(questionText.toLowerCase()) && r.valorEntero != null);

    if (ratings.length === 0) return null;
    const sum = ratings.reduce((acc, curr) => acc + (curr.valorEntero || 0), 0);
    return sum / ratings.length;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4.5 w-4.5 ${
              star <= Math.round(rating) ? "fill-amber-400 text-amber-500" : "text-slate-200 dark:text-slate-700"
            }`}
          />
        ))}
      </div>
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50/50 dark:bg-slate-900/10">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#7447D7]" />
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Cargando opiniones de alumnos...</p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalOpinions = feedbacks.length;
  const ratingQuestions = [
    { key: "calificarías al PathMentor", label: "Calidad de Asesoría" }
  ];

  // Sort feedbacks by idEntrevista descending (newest first)
  const sortedFeedbacks = [...feedbacks].sort((a, b) => (b.idEntrevista || 0) - (a.idEntrevista || 0));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-16 font-sans">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10 space-y-8">
        
        {/* Header */}
        <section className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-purple-950 to-[#7447D7] dark:from-white dark:to-purple-300 bg-clip-text text-transparent">
            Opiniones de Alumnos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl font-medium">
            Visualiza las respuestas de la encuesta de satisfacción enviadas de forma 100% anónima por los estudiantes que simularon entrevistas contigo.
          </p>
        </section>

        {error && (
          <div className="p-4 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 text-sm text-red-700 dark:text-red-400 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {totalOpinions === 0 ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-12 text-center max-w-lg mx-auto">
            <MessageSquare className="h-14 w-14 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">Aún no registras opiniones</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
              Cuando tus estudiantes completen la encuesta de satisfacción después de la simulación de entrevista, verás sus comentarios y valoraciones aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Overview Stats Dashboard (Only Total and Calidad de Asesoría in 2 columns) */}
            <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
              
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block">Total de Respuestas</span>
                <span className="text-3xl font-black text-[#7447D7] dark:text-purple-400 mt-2">{totalOpinions}</span>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-semibold">Encuestas recibidas</p>
              </div>

              {ratingQuestions.map((q) => {
                const avg = getQuestionAverage(q.key);
                return (
                  <div key={q.key} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block">{q.label}</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-black text-slate-800 dark:text-slate-250">{avg ? avg.toFixed(1) : "--"}</span>
                      <span className="text-slate-400 dark:text-slate-600 text-sm font-bold">/ 5.0</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      {avg ? renderStars(avg) : <span className="text-xs text-slate-400">Sin datos</span>}
                    </div>
                  </div>
                );
              })}

            </div>

            {/* List of Feedback Accordions */}
            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-[#7447D7]" />
                Detalle del Feedback de Estudiantes
              </h3>

              <div className="space-y-4 max-w-4xl">
                {sortedFeedbacks.map((f, index) => {
                  const ratingAnswers = f.respuestas.filter((r) => r.tipoPregunta === "RATING");
                  const textAnswers = f.respuestas.filter((r) => r.tipoPregunta === "TEXT");
                  const isExpanded = !!expandedRows[f.idEntrevista];

                  return (
                    <div
                      key={f.idEntrevista || index}
                      className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden hover:border-[#7447D7]/40 dark:hover:border-purple-800/40 transition-all duration-200"
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => toggleRow(f.idEntrevista)}
                        className="w-full flex items-center justify-between p-6 text-left focus:outline-none cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                            <Calendar className="h-4 w-4 text-[#7447D7]" />
                            <span>{f.fecha}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100/30 text-[#7447D7] dark:text-purple-400 text-[10px] font-bold">
                            <Briefcase className="h-3 w-3" />
                            <span>Postulante a: {f.puestoInteres || "No especificado"}</span>
                          </div>
                        </div>
                        <div className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                          {isExpanded ? (
                            <ChevronUp className="h-5.5 w-5.5 text-[#7447D7]" />
                          ) : (
                            <ChevronDown className="h-5.5 w-5.5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-950/20 animate-in slide-in-from-top-2 duration-200">
                          {/* Rating answers */}
                          {ratingAnswers.length > 0 && (
                            <div className="space-y-4 mb-5 pt-3">
                              {ratingAnswers.map((r, rIdx) => (
                                <div key={rIdx} className="space-y-1">
                                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight block">
                                    {r.textoPregunta}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {r.valorEntero != null ? (
                                      <>
                                        {renderStars(r.valorEntero)}
                                        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                                          {r.valorEntero} / 5
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-xs text-slate-400 italic">No respondida</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Text answers / comments */}
                          {textAnswers.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-dashed border-slate-150 dark:border-slate-800 space-y-4">
                              {textAnswers.map((r, rIdx) => (
                                <div key={rIdx} className="space-y-1.5">
                                  <span className="text-[11px] font-bold text-[#7447D7] dark:text-purple-400 uppercase tracking-wider block">
                                    {r.textoPregunta}
                                  </span>
                                  <p className="text-xs font-semibold leading-relaxed italic bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-350 break-words">
                                    &ldquo;{r.valorTexto || "Sin comentarios."}&rdquo;
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
