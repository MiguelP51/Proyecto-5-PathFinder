"use client";

import { useEffect, useState } from "react";
import { Plus, Settings, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { satisfactionAdminService, SatisfactionSurveyResponseDTO } from "@/lib/satisfaction/adminService";

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<SatisfactionSurveyResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    satisfactionAdminService.getAll().then(data => {
      setSurveys(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0E3E66] flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-blue-500" />
            Encuestas de Satisfacción
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Configura encuestas dinámicas para evaluar la experiencia de los estudiantes.
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/admin/surveys/new'}
          className="flex items-center gap-2 self-start rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 shadow-md shadow-blue-200 transition text-sm font-bold">
          <Plus className="h-4 w-4" />
          <span>Nueva Encuesta</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Disparador</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-center">Preguntas</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Cargando encuestas...</td>
                </tr>
              ) : surveys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No hay encuestas configuradas.</td>
                </tr>
              ) : (
                surveys.map((survey) => (
                  <tr key={survey.idSurvey} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{survey.title}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
                        {survey.targetType} {survey.targetId ? `(ID: ${survey.targetId})` : '(TODOS)'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {survey.status === 'ACTIVE' ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 w-fit">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Activa
                        </span>
                      ) : survey.status === 'DRAFT' ? (
                        <span className="flex items-center gap-1.5 text-amber-600 font-bold text-xs bg-amber-50 px-3 py-1 rounded-full border border-amber-100 w-fit">
                          <Settings className="h-3.5 w-3.5" /> Borrador
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-600 font-bold text-xs bg-slate-100 px-3 py-1 rounded-full border border-slate-200 w-fit">
                          <AlertCircle className="h-3.5 w-3.5" /> Archivada
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-bold">{survey.questions?.length || 0}</td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
