"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { satisfactionAdminService, SatisfactionSurveyRequestDTO, SatisfactionQuestionDTO } from "@/lib/satisfaction/adminService";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditSurveyPage({ params }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const unwrappedParams = React.use(params);
  const id = Number(unwrappedParams.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<SatisfactionSurveyRequestDTO>({
    title: "",
    status: "DRAFT",
    questions: []
  });

  useEffect(() => {
    if (status !== "authenticated" || !session?.backendJwt) return;
    satisfactionAdminService.getById(id, session.backendJwt).then(data => {
      setFormData({
        title: data.title,
        status: data.status,
        questions: data.questions || []
      });
      setLoading(false);
    }).catch(err => {
      console.error("Error loading survey:", err);
      alert("Error al cargar la encuesta");
      router.push("/admin/surveys");
    });
  }, [id, status, session]);

  const handleAddQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { questionText: "", questionType: "RATING", isMandatory: true, orderIndex: prev.questions.length, section: "MENTOR" }
      ]
    }));
  };

  const handleUpdateQuestion = (index: number, field: keyof SatisfactionQuestionDTO, value: any) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    newQuestions.forEach((q, i) => q.orderIndex = i);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await satisfactionAdminService.update(id, formData, session?.backendJwt);
      router.push("/admin/surveys");
    } catch (error) {
      console.error("Error updating survey:", error);
      alert("Error al guardar los cambios de la encuesta");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <Link 
        href="/admin/surveys" 
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a encuestas
      </Link>

      <h1 className="text-3xl font-black tracking-tight text-[#0E3E66]">Editar Encuesta</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Configuración General</h2>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Título de la Encuesta</label>
            <input 
              type="text" 
              required
              className="w-full border-slate-200 rounded-xl px-4 py-2 text-sm"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ej. Encuesta General de Satisfacción"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Estado</label>
              <select 
                className="w-full border-slate-200 rounded-xl px-4 py-2 text-sm"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="DRAFT">Borrador</option>
                <option value="ACTIVE">Activa</option>
                <option value="HISTORICAL">Histórica</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xl font-bold text-slate-800">Preguntas</h2>
            <button 
              type="button" 
              onClick={handleAddQuestion}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-sm font-bold transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Añadir Pregunta
            </button>
          </div>

          {formData.questions.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No hay preguntas agregadas. Haz clic en "Añadir Pregunta".</p>
          ) : (
            <div className="space-y-4">
              {formData.questions.map((q, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex gap-4 items-start">
                  <div className="font-bold text-slate-400 pt-2">{idx + 1}.</div>
                  <div className="flex-1 space-y-3">
                    <input 
                      type="text" 
                      required
                      className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm"
                      placeholder="Escribe la pregunta aquí..."
                      value={q.questionText}
                      onChange={(e) => handleUpdateQuestion(idx, 'questionText', e.target.value)}
                    />
                    <div className="flex gap-4 items-center flex-wrap">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo</label>
                        <select 
                          className="border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white"
                          value={q.questionType}
                          onChange={(e) => handleUpdateQuestion(idx, 'questionType', e.target.value)}
                        >
                          <option value="RATING">Calificación (1-5 Estrellas)</option>
                          <option value="TEXT">Texto Abierto</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Sección</label>
                        <select 
                          className="border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white"
                          value={q.section || "MENTOR"}
                          onChange={(e) => handleUpdateQuestion(idx, 'section', e.target.value)}
                        >
                          <option value="MENTOR">Califica a tu PathMentor</option>
                          <option value="SKILLPATH_CHALLENGE">Experiencia con SkillPaths y Challenges</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1 justify-end pt-5">
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={q.isMandatory}
                            onChange={(e) => handleUpdateQuestion(idx, 'isMandatory', e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          Obligatoria
                        </label>
                      </div>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-red-400 hover:text-red-600 transition p-2 cursor-pointer"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-6 flex justify-end gap-3 border-t">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition text-sm cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={saving || formData.questions.length === 0}
            className="bg-[#0E3E66] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition disabled:opacity-50 text-sm cursor-pointer"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
