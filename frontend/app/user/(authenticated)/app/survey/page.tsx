'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { 
  Star, 
  Smile, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  Sparkles,
  ClipboardList
} from "lucide-react";
import Link from "next/link";

interface Pregunta {
  idPregunta: number;
  textoPregunta: string;
  tipoPregunta: string; // "RATING" | "TEXT"
  obligatoria: boolean;
}

interface RespuestaState {
  [idPregunta: number]: {
    valorEntero?: number;
    valorTexto?: string;
  };
}

export default function SurveyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const searchParams = useSearchParams();
  const idEntrevista = searchParams.get("idEntrevista");

  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [completada, setCompletada] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [respuestas, setRespuestas] = useState<RespuestaState>({});

  // Hover states for star ratings
  const [hoveredStars, setHoveredStars] = useState<{ [idPregunta: number]: number }>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.backendJwt) {
      checkSurveyStatusAndLoadQuestions();
    }
  }, [status, session]);

  const checkSurveyStatusAndLoadQuestions = async () => {
    try {
      setLoading(true);
      // 1. Check if already completed
      const checkUrl = idEntrevista 
        ? `/api/encuestas/completada?idEntrevista=${idEntrevista}`
        : "/api/encuestas/completada";
      const statusData = await apiFetch<{ completada: boolean }>(checkUrl, {}, session?.backendJwt);
      if (statusData.completada) {
        setCompletada(true);
        setLoading(false);
        return;
      }

      // 2. Load questions
      const questionsData = await apiFetch<Pregunta[]>("/api/encuestas/preguntas", {}, session?.backendJwt);
      setPreguntas(questionsData);
      
      // Initialize answers state
      const initialAnswers: RespuestaState = {};
      const saved = localStorage.getItem(`survey_answers_${session?.user?.email || 'default'}`);
      let parsedSaved: RespuestaState = {};
      if (saved) {
        try {
          parsedSaved = JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing saved survey draft:", e);
        }
      }

      questionsData.forEach(q => {
        initialAnswers[q.idPregunta] = {
          valorEntero: parsedSaved[q.idPregunta]?.valorEntero ?? undefined,
          valorTexto: parsedSaved[q.idPregunta]?.valorTexto ?? ""
        };
      });
      setRespuestas(initialAnswers);
    } catch (err) {
      console.error("Error loading survey details:", err);
      toast.error("No se pudieron cargar las preguntas de la encuesta.");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (idPregunta: number, rating: number) => {
    setRespuestas(prev => {
      const updated = {
        ...prev,
        [idPregunta]: {
          ...prev[idPregunta],
          valorEntero: rating
        }
      };
      if (session?.user?.email) {
        localStorage.setItem(`survey_answers_${session.user.email}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleTextChange = (idPregunta: number, text: string) => {
    setRespuestas(prev => {
      const updated = {
        ...prev,
        [idPregunta]: {
          ...prev[idPregunta],
          valorTexto: text
        }
      };
      if (session?.user?.email) {
        localStorage.setItem(`survey_answers_${session.user.email}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validations
    for (const pregunta of preguntas) {
      const resp = respuestas[pregunta.idPregunta];
      if (pregunta.obligatoria) {
        if (!resp) {
          toast.warning(`Por favor responde la pregunta: "${pregunta.textoPregunta}"`);
          return;
        }
        if (pregunta.tipoPregunta === "RATING" && (resp.valorEntero === undefined || resp.valorEntero === 0)) {
          toast.warning(`La calificación para la pregunta "${pregunta.textoPregunta}" es obligatoria.`);
          return;
        }
        if (pregunta.tipoPregunta === "TEXT" && (!resp.valorTexto || !resp.valorTexto.trim())) {
          toast.warning(`La respuesta de texto para la pregunta "${pregunta.textoPregunta}" es obligatoria.`);
          return;
        }
      }
    }

    // Map responses to match API structure
    const payload = {
      idEntrevista: idEntrevista ? parseInt(idEntrevista, 10) : null,
      respuestas: Object.keys(respuestas).map(idStr => {
        const id = parseInt(idStr, 10);
        return {
          idPregunta: id,
          valorEntero: respuestas[id].valorEntero,
          valorTexto: respuestas[id].valorTexto?.trim() || null
        };
      })
    };

    try {
      setSubmitting(true);
      await apiFetch("/api/encuestas/submit", {
        method: "POST",
        body: JSON.stringify(payload)
      }, session?.backendJwt);

      if (session?.user?.email) {
        localStorage.removeItem(`survey_answers_${session.user.email}`);
      }

      toast.success("¡Encuesta enviada con éxito! Agradecemos enormemente tus comentarios.");
      setCompletada(true);
    } catch (err) {
      console.error("Error submitting survey:", err);
      toast.error(err instanceof Error ? err.message : "Error al enviar la encuesta de satisfacción.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#7447D7]" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Cargando encuesta de satisfacción...</p>
        </div>
      </div>
    );
  }

  if (completada) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/20 dark:from-slate-950 dark:to-slate-900 pb-16 pt-8 flex items-center justify-center">
        <main className="mx-auto w-full max-w-xl px-4 text-center">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-md">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-6 animate-bounce" />
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">¡Muchas gracias por tu feedback!</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
              Tus respuestas han sido guardadas y serán de gran ayuda para seguir optimizando la plataforma y las simulaciones de entrevista.
            </p>
            <Link
              href="/user/home"
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7447D7] to-[#D43EE6] px-6 text-sm font-bold text-white transition hover:opacity-90 shadow-md shadow-purple-200/50 cursor-pointer"
            >
              Volver al panel principal
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/20 dark:from-slate-950 dark:to-slate-900 pb-16 pt-8 font-sans">
      <main className="mx-auto w-full max-w-2xl px-4">
        
        {/* Back Link */}
        <Link 
          href="/user/home" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#7447D7] dark:hover:text-purple-400 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel principal
        </Link>

        {/* Header section */}
        <section className="mb-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-2.5 justify-center sm:justify-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/50 text-[#7447D7] dark:text-purple-400">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Evaluación de Experiencia
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xl">
            Por favor, responde con sinceridad las siguientes preguntas sobre tu proceso en PathFinder. Tu retroalimentación nos ayuda a mejorar de cara al futuro.
          </p>
        </section>

        {/* Survey Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {preguntas.map((pregunta, index) => {
            const currentRating = respuestas[pregunta.idPregunta]?.valorEntero || 0;
            const currentHover = hoveredStars[pregunta.idPregunta] || 0;

            return (
              <article 
                key={pregunta.idPregunta}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 flex gap-2">
                    <span className="text-[#7447D7] dark:text-purple-400 font-black">{index + 1}.</span>
                    {pregunta.textoPregunta}
                  </h3>
                  {pregunta.obligatoria && (
                    <span className="text-[10px] font-bold tracking-wider uppercase bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full flex-shrink-0">
                      Obligatorio
                    </span>
                  )}
                </div>

                {/* Rating Input type */}
                {pregunta.tipoPregunta === "RATING" && (
                  <div className="flex gap-2.5 items-center py-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = star <= (currentHover || currentRating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(pregunta.idPregunta, star)}
                          onMouseEnter={() => setHoveredStars(prev => ({ ...prev, [pregunta.idPregunta]: star }))}
                          onMouseLeave={() => setHoveredStars(prev => ({ ...prev, [pregunta.idPregunta]: 0 }))}
                          className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star 
                            className={`h-8 w-8 ${
                              isActive 
                                ? "fill-amber-400 text-amber-400" 
                                : "text-slate-200 dark:text-slate-800"
                            }`}
                          />
                        </button>
                      );
                    })}
                    {currentRating > 0 && (
                      <span className="text-xs font-bold text-[#7447D7] dark:text-purple-400 ml-2">
                        {currentRating} de 5
                      </span>
                    )}
                  </div>
                )}

                {/* Text input type */}
                {pregunta.tipoPregunta === "TEXT" && (
                  <textarea
                    rows={4}
                    value={respuestas[pregunta.idPregunta]?.valorTexto || ""}
                    onChange={(e) => handleTextChange(pregunta.idPregunta, e.target.value)}
                    placeholder="Escribe tu opinión aquí..."
                    className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#7447D7] dark:focus:border-purple-400 resize-none"
                  />
                )}
              </article>
            );
          })}

          {/* Form Actions */}
          <div className="flex gap-3 justify-end items-center mt-8">
            <Link
              href="/user/home"
              className="px-6 h-11 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 transition cursor-pointer flex items-center justify-center"
            >
              Responder más tarde
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 h-11 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-[#7447D7] to-[#D43EE6] hover:opacity-95 transition shadow-lg shadow-purple-200/50 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Smile className="h-4 w-4" />
                  Enviar Encuesta
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
