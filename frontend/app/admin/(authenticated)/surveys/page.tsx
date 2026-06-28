"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Settings, CheckCircle2, MessageSquare, AlertCircle, History, Eye, X, Star, Calendar, User, Mail, Sparkles } from "lucide-react";
import { satisfactionAdminService, SatisfactionSurveyResponseDTO, SatisfactionSubmissionResponseDTO } from "@/lib/satisfaction/adminService";
import { apiFetch } from "@/lib/api";

export default function SurveysPage() {
  const { data: session, status } = useSession();
  const [surveys, setSurveys] = useState<SatisfactionSurveyResponseDTO[]>([]);
  const [submissions, setSubmissions] = useState<SatisfactionSubmissionResponseDTO[]>([]);
  
  // Mentor Survey specific states
  const [mentorQuestionsCount, setMentorQuestionsCount] = useState(0);
  const [mentorSubmissions, setMentorSubmissions] = useState<SatisfactionSubmissionResponseDTO[]>([]);

  const [activeTab, setActiveTab] = useState<"surveys" | "history">("surveys");
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<SatisfactionSubmissionResponseDTO | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.backendJwt) return;
    setLoading(true);

    const loadData = async () => {
      try {
        if (activeTab === "surveys") {
          // Fetch general surveys
          const generalSurveys = await satisfactionAdminService.getAll(session.backendJwt);
          setSurveys(generalSurveys);

          // Fetch mentor survey questions to count them
          const mentorQuestions = await apiFetch<any[]>('/api/admin/encuestas/preguntas', {}, session.backendJwt);
          const activeOnes = (mentorQuestions || []).filter(q => q.activo);
          setMentorQuestionsCount(activeOnes.length);
        } else {
          // Fetch general submissions
          const generalSubs = await satisfactionAdminService.getAllSubmissions(session.backendJwt);
          setSubmissions(generalSubs);

          // Fetch mentor survey submissions
          const mentorSubs = await apiFetch<SatisfactionSubmissionResponseDTO[]>('/api/admin/encuestas/submissions', {}, session.backendJwt);
          setMentorSubmissions(mentorSubs || []);
        }
      } catch (err) {
        console.error("Error loading surveys data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab, status, session]);

  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return "";
    try {
      const d = new Date(fechaStr);
      return d.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return fechaStr;
    }
  };

  const getAnswersBySection = (submission: SatisfactionSubmissionResponseDTO, section: string) => {
    return submission.answers.filter(a => a.section === section);
  };

  const isMentorSurvey = selectedSubmission?.surveyTitle?.includes("Post-Entrevista");

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0E3E66] flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-blue-500" />
            Encuestas de Satisfacción
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Configura encuestas dinámicas y revisa la retroalimentación de los estudiantes.
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/admin/surveys/new'}
          className="flex items-center gap-2 self-start rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 shadow-md shadow-blue-200 transition text-sm font-bold cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>Nueva Encuesta General</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("surveys")}
          className={`px-5 py-2 text-sm font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === "surveys" 
              ? "bg-white text-[#0E3E66] shadow-sm" 
              : "text-slate-500 hover:text-[#0E3E66]"
          }`}
        >
          <Settings className="h-4 w-4" />
          Configuración de Encuestas
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2 text-sm font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === "history" 
              ? "bg-white text-[#0E3E66] shadow-sm" 
              : "text-slate-500 hover:text-[#0E3E66]"
          }`}
        >
          <History className="h-4 w-4" />
          Historial de Respuestas
        </button>
      </div>

      {activeTab === "surveys" ? (
        <div className="space-y-8 animate-fade-in">
          {/* Section 1: General Surveys */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">1. Encuestas de Satisfacción General</h2>
              <p className="text-slate-400 text-xs mt-0.5">Encuestas mostradas en el Dashboard a los estudiantes al completar etapas.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Título</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-center">Preguntas Activas</th>
                    <th className="px-6 py-4">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Cargando encuestas...</td>
                    </tr>
                  ) : surveys.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No hay encuestas generales configuradas.</td>
                    </tr>
                  ) : (
                    surveys.map((survey) => (
                      <tr key={survey.idSurvey} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-bold text-slate-900">{survey.title}</td>
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
                        <td className="px-6 py-4 text-center font-bold">{survey.questions?.filter(q => q.orderIndex >= 0)?.length || 0}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => window.location.href = `/admin/surveys/${survey.idSurvey}`}
                            className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition cursor-pointer font-bold"
                          >
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

          {/* Section 2: PathMentor Surveys */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  2. Encuesta de Satisfacción Post-Entrevista (PathMentor)
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">Encuesta específica que evalúa la simulación de entrevista y mentoría recibida.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Título de Encuesta</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-center">Preguntas Activas</th>
                    <th className="px-6 py-4">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">Encuesta Post-Entrevista (PathMentor)</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 w-fit">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Activa (Sistema)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold">{loading ? "..." : mentorQuestionsCount}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => window.location.href = `/admin/surveys/mentor`}
                        className="text-purple-600 hover:text-purple-800 font-bold text-xs bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Editar Preguntas
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Submissions Section 1: General Surveys */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">Respuestas a Encuestas Generales</h2>
              <p className="text-slate-400 text-xs mt-0.5">Respuestas enviadas en el portal por alumnos de Gestión.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Estudiante</th>
                    <th className="px-6 py-4">Encuesta</th>
                    <th className="px-6 py-4">Fecha de Envío</th>
                    <th className="px-6 py-4">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Cargando respuestas...</td>
                    </tr>
                  ) : submissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Aún no se han recibido respuestas generales.</td>
                    </tr>
                  ) : (
                    submissions.map((sub) => (
                      <tr key={sub.idSubmission} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{sub.studentName}</span>
                            <span className="text-xs text-slate-500 font-mono">{sub.studentEmail}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{sub.surveyTitle}</td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{formatFecha(sub.submittedAt)}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => setSelectedSubmission(sub)}
                            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver Respuestas
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submissions Section 2: Mentor Surveys */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Respuestas de Simulación de Entrevistas (PathMentor)
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">Respuestas enviadas por estudiantes tras culminar sus entrevistas virtuales o presenciales.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Estudiante</th>
                    <th className="px-6 py-4">Detalle / Puesto</th>
                    <th className="px-6 py-4">Fecha de Envío</th>
                    <th className="px-6 py-4">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Cargando respuestas...</td>
                    </tr>
                  ) : mentorSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Aún no se han recibido respuestas para entrevistas.</td>
                    </tr>
                  ) : (
                    mentorSubmissions.map((sub) => (
                      <tr key={sub.idSubmission} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{sub.studentName}</span>
                            <span className="text-xs text-slate-500 font-mono">{sub.studentEmail}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700 max-w-md truncate">{sub.surveyTitle}</td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{formatFecha(sub.submittedAt)}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => setSelectedSubmission(sub)}
                            className="flex items-center gap-1.5 text-purple-600 hover:text-purple-800 font-bold text-xs bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver Respuestas
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
      )}

      {/* Modal de Detalle de Respuestas */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 p-6 max-h-[85vh] overflow-y-auto flex flex-col gap-6 animate-scale-up">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#0E3E66]">{selectedSubmission.surveyTitle}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {selectedSubmission.studentName}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {selectedSubmission.studentEmail}</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Enviada el: {formatFecha(selectedSubmission.submittedAt)}
                </p>
              </div>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Sección A: PathMentor */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg">
                  {isMentorSurvey ? "Calificación de la Simulación y Mentoría" : "1. Calificación a tu PathMentor"}
                </h4>
                {getAnswersBySection(selectedSubmission, "MENTOR").length === 0 ? (
                  <p className="text-xs text-slate-400 italic px-2">No hay respuestas registradas en esta sección.</p>
                ) : (
                  <div className="space-y-3 pl-2">
                    {getAnswersBySection(selectedSubmission, "MENTOR").map((ans, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <p className="text-sm font-semibold text-slate-800">{ans.questionText}</p>
                        {ans.questionType === "RATING" ? (
                          <div className="flex items-center gap-1.5">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                  key={star} 
                                  className={`h-4 w-4 ${star <= (ans.ratingValue || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-slate-600">({ans.ratingValue} de 5)</span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 bg-slate-50 border p-2.5 rounded-xl whitespace-pre-wrap">{ans.textValue || "[Sin respuesta]"}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sección B: Experiencia con los SkillPaths y Challenges */}
              {!isMentorSurvey && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                    2. Experiencia con los SkillPaths y Challenges
                  </h4>
                  {getAnswersBySection(selectedSubmission, "SKILLPATH_CHALLENGE").length === 0 ? (
                    <p className="text-xs text-slate-400 italic px-2">No hay respuestas registradas en esta sección.</p>
                  ) : (
                    <div className="space-y-3 pl-2">
                      {getAnswersBySection(selectedSubmission, "SKILLPATH_CHALLENGE").map((ans, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <p className="text-sm font-semibold text-slate-800">{ans.questionText}</p>
                          {ans.questionType === "RATING" ? (
                            <div className="flex items-center gap-1.5">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star 
                                    key={star} 
                                    className={`h-4 w-4 ${star <= (ans.ratingValue || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-bold text-slate-600">({ans.ratingValue} de 5)</span>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-600 bg-slate-50 border p-2.5 rounded-xl whitespace-pre-wrap">{ans.textValue || "[Sin respuesta]"}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t pt-4 flex justify-end">
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
