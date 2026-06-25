"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft, Plus, Settings, CheckCircle2, MessageSquare, AlertCircle, Save, Check, X, Star } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Question {
  idPregunta: number;
  textoPregunta: string;
  tipoPregunta: string; // RATING, TEXT
  obligatoria: boolean;
  activo: boolean;
}

export default function MentorSurveyConfigPage() {
  const { data: session, status } = useSession();
  const token = session?.backendJwt;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // New question form state
  const [newText, setNewText] = useState("");
  const [newType, setNewType] = useState("RATING");
  const [newRequired, setNewRequired] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editRequired, setEditRequired] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchQuestions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiFetch<Question[]>("/api/admin/encuestas/preguntas", {}, token);
      setQuestions(data || []);
    } catch (err: any) {
      console.error(err);
      setError("Error al cargar las preguntas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && token) {
      fetchQuestions();
    }
  }, [status, token]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    try {
      await apiFetch("/api/admin/encuestas/preguntas", {
        method: "POST",
        body: JSON.stringify({
          textoPregunta: newText.trim(),
          tipoPregunta: newType,
          obligatoria: newRequired
        })
      }, token);

      setSuccess("Pregunta creada con éxito");
      setNewText("");
      setNewRequired(false);
      fetchQuestions();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Error al crear la pregunta");
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleStartEdit = (q: Question) => {
    setEditingId(q.idPregunta);
    setEditText(q.textoPregunta);
    setEditRequired(q.obligatoria);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleSaveEdit = async (id: number) => {
    if (!editText.trim()) return;
    try {
      await apiFetch(`/api/admin/encuestas/preguntas/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          textoPregunta: editText.trim(),
          obligatoria: editRequired
        })
      }, token);

      setSuccess("Pregunta actualizada con éxito");
      setEditingId(null);
      fetchQuestions();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Error al actualizar la pregunta");
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleToggleActive = async (q: Question) => {
    try {
      await apiFetch(`/api/admin/encuestas/preguntas/${q.idPregunta}`, {
        method: "PUT",
        body: JSON.stringify({
          activo: !q.activo
        })
      }, token);

      setSuccess(q.activo ? "Pregunta desactivada con éxito" : "Pregunta activada con éxito");
      fetchQuestions();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Error al cambiar estado");
      setTimeout(() => setError(null), 4000);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => window.location.href = "/admin/surveys"}
          className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#0E3E66] flex items-center gap-2">
            Preguntas — Encuesta Post-Entrevista
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Gestiona la encuesta de satisfacción que rellenan los alumnos sobre el PathMentor.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
          {success}
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
          {error}
        </div>
      )}

      {/* Add question form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-500" />
          Agregar Nueva Pregunta
        </h2>
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Texto de la Pregunta</label>
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="¿Qué tan claro fue el mentor con el feedback de competencias?"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Respuesta</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition bg-white"
              >
                <option value="RATING">Escala de 1 a 5 Estrellas (RATING)</option>
                <option value="TEXT">Texto Abierto (TEXT)</option>
              </select>
            </div>
            <div className="flex items-center gap-3.5 sm:mt-6">
              <input
                type="checkbox"
                id="newRequired"
                checked={newRequired}
                onChange={(e) => setNewRequired(e.target.checked)}
                className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="newRequired" className="text-sm font-bold text-slate-600 cursor-pointer select-none">
                Respuesta Obligatoria
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-bold transition shadow-md shadow-blue-100 cursor-pointer"
          >
            Agregar Pregunta
          </button>
        </form>
      </div>

      {/* Questions list */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-800">Preguntas Existentes</h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-medium">Cargando preguntas de la encuesta...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium border-2 border-dashed rounded-2xl">
            No hay preguntas configuradas en esta encuesta.
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => {
              const isEditing = editingId === q.idPregunta;
              return (
                <div 
                  key={q.idPregunta} 
                  className={`border rounded-2xl p-4.5 transition-all ${
                    !q.activo 
                      ? "bg-slate-50 border-slate-200 opacity-60" 
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Texto de la Pregunta</label>
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`editReq_${q.idPregunta}`}
                            checked={editRequired}
                            onChange={(e) => setEditRequired(e.target.checked)}
                            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                          />
                          <label htmlFor={`editReq_${q.idPregunta}`} className="text-xs font-bold text-slate-600 cursor-pointer">Obligatorio</label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCancelEdit()}
                            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" /> Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveEdit(q.idPregunta)}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            <Save className="h-3.5 w-3.5" /> Guardar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800 text-sm">{q.textoPregunta}</span>
                          {q.obligatoria && (
                            <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 font-bold px-2 py-0.5 rounded-md uppercase">Obligatorio</span>
                          )}
                          {!q.activo && (
                            <span className="text-[10px] bg-slate-200 text-slate-600 border border-slate-300 font-bold px-2 py-0.5 rounded-md uppercase">Desactivada</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                          <span>Tipo: {q.tipoPregunta}</span>
                          <span>•</span>
                          {q.tipoPregunta === "RATING" ? (
                            <span className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                            </span>
                          ) : (
                            <span>Texto Libre</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {q.activo && (
                          <button
                            onClick={() => handleStartEdit(q)}
                            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl transition cursor-pointer"
                          >
                            Editar
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(q)}
                          className={`text-xs font-black px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                            q.activo 
                              ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-100" 
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100"
                          }`}
                        >
                          {q.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
