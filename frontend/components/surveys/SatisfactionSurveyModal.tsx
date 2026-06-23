"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { X, Star } from "lucide-react";
import { PendingSurveyResponseDTO, SubmitSurveyRequestDTO, satisfactionStudentService } from "@/lib/satisfaction/studentService";

interface Props {
  survey: PendingSurveyResponseDTO;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function SatisfactionSurveyModal({ survey, onClose, onSubmitted }: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, { ratingValue?: number; textValue?: string }>>({});

  const handleRatingChange = (questionId: number, rating: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], ratingValue: rating }
    }));
  };

  const handleTextChange = (questionId: number, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], textValue: text }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check mandatory
    for (const q of survey.questions) {
      if (q.isMandatory) {
        const ans = answers[q.idQuestion!];
        if (!ans || (q.questionType === 'RATING' && !ans.ratingValue) || (q.questionType === 'TEXT' && !ans.textValue?.trim())) {
          alert("Por favor responde todas las preguntas obligatorias.");
          return;
        }
      }
    }

    setLoading(true);
    try {
      const payload: SubmitSurveyRequestDTO = {
        surveyId: survey.idSurvey,
        answers: Object.entries(answers).map(([qId, ans]) => ({
          questionId: Number(qId),
          ratingValue: ans.ratingValue,
          textValue: ans.textValue
        }))
      };

      await satisfactionStudentService.submitSurvey(payload, session?.backendJwt);
      onSubmitted();
    } catch (error) {
      console.error(error);
      // Failsafe: if it fails, just close it so we don't block the user
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-[#0E3E66]">{survey.title}</h2>
            <p className="text-slate-500 mt-2">¡Felicidades por tu logro! Nos encantaría conocer tu experiencia.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {survey.questions.map((q, idx) => (
              <div key={q.idQuestion} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-800 mb-4">
                  {idx + 1}. {q.questionText}
                  {q.isMandatory && <span className="text-red-500 ml-1">*</span>}
                </p>

                {q.questionType === 'RATING' ? (
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(q.idQuestion!, star)}
                        className={`p-2 transition ${answers[q.idQuestion!]?.ratingValue! >= star ? 'text-amber-400' : 'text-slate-300 hover:text-amber-200'}`}
                      >
                        <Star className="h-10 w-10 fill-current" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border-slate-200 p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Escribe tu respuesta aquí..."
                    value={answers[q.idQuestion!]?.textValue || ""}
                    onChange={(e) => handleTextChange(q.idQuestion!, e.target.value)}
                  />
                )}
              </div>
            ))}

            <div className="pt-4 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition"
              >
                Saltar por ahora
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-3 rounded-xl font-bold bg-[#0E3E66] text-white hover:bg-blue-900 shadow-md transition disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar Respuestas"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
