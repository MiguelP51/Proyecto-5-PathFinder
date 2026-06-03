"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Brain, ArrowLeft, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Opcion {
  idOpcionPreguntaDisc: number;
  textoOpcion: string;
  valorRespuesta: number;
  ordenOpcion: number;
}

interface Pregunta {
  idPreguntaDisc: number;
  enunciado: string;
  categoriaDisc: string;
  ordenPregunta: number;
  obligatoria: boolean;
  opciones: Opcion[];
}

export default function DiscTestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Estados
  const [questions, setQuestions] = useState<Pregunta[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const questionsPerPage = 5;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.backendJwt) {
      loadQuestions();
    }
  }, [status, session, router]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch<Pregunta[]>("/api/disc/questions", {}, session?.backendJwt);
      setQuestions(data || []);
    } catch (err) {
      console.error("Error cargando preguntas:", err);
      setError(err instanceof Error ? err.message : "Error cargando las preguntas del test");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));

    // Micro-interacción: auto scroll suave al siguiente elemento en móviles/pantallas si está disponible
    setTimeout(() => {
      const currentElement = document.getElementById(`question-${questionId}`);
      if (currentElement) {
        const nextId = questions.findIndex(q => q.idPreguntaDisc === questionId) + 1;
        if (nextId < questions.length) {
          const nextQuestion = questions[nextId];
          const nextElement = document.getElementById(`question-${nextQuestion.idPreguntaDisc}`);
          if (nextElement && isElementOnCurrentPage(nextQuestion.idPreguntaDisc)) {
            nextElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }
    }, 150);
  };

  const isElementOnCurrentPage = (qId: number) => {
    const idx = questions.findIndex(q => q.idPreguntaDisc === qId);
    if (idx === -1) return false;
    const page = Math.floor(idx / questionsPerPage);
    return page === currentPage;
  };

  const validateCurrentPage = () => {
    const startIndex = currentPage * questionsPerPage;
    const pageQuestions = questions.slice(startIndex, startIndex + questionsPerPage);

    for (const q of pageQuestions) {
      if (q.obligatoria && !answers[q.idPreguntaDisc]) {
        return false;
      }
    }
    return true;
  };

  const handleNextPage = () => {
    if (!validateCurrentPage()) {
      setError("Por favor, responde todas las preguntas obligatorias de esta página antes de continuar.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setError("");
    setCurrentPage((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevPage = () => {
    setError("");
    setCurrentPage((prev) => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateCurrentPage()) {
      setError("Por favor, responde todas las preguntas obligatorias antes de finalizar.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Verificar si faltan responder preguntas del test general
    const unanswered = questions.filter(q => q.obligatoria && !answers[q.idPreguntaDisc]);
    if (unanswered.length > 0) {
      setError("Faltan preguntas por responder en páginas anteriores.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = Object.entries(answers).map(([qId, optId]) => ({
        idPreguntaDisc: Number(qId),
        idOpcionPreguntaDisc: optId,
      }));

      await apiFetch("/api/disc/submit", {
        method: "POST",
        body: JSON.stringify(payload),
      }, session?.backendJwt);

      router.push("/user/app/disc-results");
    } catch (err) {
      console.error("Error enviando test DISC:", err);
      setError(err instanceof Error ? err.message : "Error enviando tus respuestas. Intenta de nuevo.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#7447D7]" />
          <p className="text-lg font-medium text-slate-600">Cargando evaluación DISC...</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const startIndex = currentPage * questionsPerPage;
  const pageQuestions = questions.slice(startIndex, startIndex + questionsPerPage);
  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fbf7ff] via-white to-[#effffd] text-[#081333] pb-16">
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        
        {/* Header con título y progreso */}
        <section className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7447D7] to-[#D43EE6] text-white shadow-md">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Evaluación Psicométrica DISC</h1>
              <p className="text-sm text-slate-500">Mapea tu estilo conductual natural</p>
            </div>
          </div>

          {/* Barra de progreso interactiva */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-bold text-slate-700">
              <span>Progreso de la evaluación</span>
              <span className="text-[#7447D7]">{answeredCount} de {questions.length} preguntas ({progressPercent}%)</span>
            </div>
            <div className="mt-3 h-3.5 overflow-hidden rounded-full bg-slate-100 border border-slate-50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7447D7] to-[#D43EE6] transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 text-right text-xs font-semibold text-slate-400">
              Página {currentPage + 1} de {totalPages}
            </div>
          </div>
        </section>

        {/* Alerta de Error */}
        {error && (
          <article className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm animate-shake">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="font-semibold leading-relaxed">{error}</p>
          </article>
        )}

        {/* Listado de Preguntas */}
        <section className="space-y-6">
          {pageQuestions.map((q, idx) => {
            const questionNumber = startIndex + idx + 1;
            const selectedOption = answers[q.idPreguntaDisc];

            return (
              <article
                key={q.idPreguntaDisc}
                id={`question-${q.idPreguntaDisc}`}
                className={`rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 ${
                  selectedOption ? "border-purple-200 shadow-purple-50/20" : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-purple-50 text-sm font-extrabold text-[#7447D7]">
                    {questionNumber}
                  </span>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-800 leading-relaxed">
                      {q.enunciado}
                      {q.obligatoria && <span className="text-red-500 ml-1">*</span>}
                    </h2>

                    {/* Escala Likert de Opciones */}
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-5">
                      {q.opciones.map((opt) => {
                        const isSelected = selectedOption === opt.idOpcionPreguntaDisc;
                        return (
                          <button
                            key={opt.idOpcionPreguntaDisc}
                            type="button"
                            onClick={() => handleSelectOption(q.idPreguntaDisc, opt.idOpcionPreguntaDisc)}
                            className={`flex flex-col items-center justify-center rounded-xl border p-3.5 transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "border-[#7447D7] bg-[#7447D7]/5 text-[#7447D7] font-bold shadow-sm"
                                : "border-slate-200 text-slate-600 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <span className="text-xs text-center leading-normal mb-1">{opt.textoOpcion}</span>
                            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                              isSelected ? "bg-[#7447D7] text-white" : "bg-slate-200 text-slate-600"
                            }`}>
                              {opt.valorRespuesta}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Botones de Navegación */}
        <footer className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage === 0 || submitting}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-[#7447D7] hover:text-[#7447D7] disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-700 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </button>

          {currentPage < totalPages - 1 ? (
            <button
              type="button"
              onClick={handleNextPage}
              disabled={submitting}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#7447D7] px-6 text-sm font-bold text-white transition hover:opacity-90 cursor-pointer"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7447D7] to-[#D43EE6] px-8 text-sm font-bold text-white shadow-md shadow-purple-200/50 transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Finalizar evaluación
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </footer>

      </main>
    </div>
  );
}
