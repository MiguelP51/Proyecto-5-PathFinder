"use client";

import { useEffect, useState } from "react";
import { PendingSurveyResponseDTO, satisfactionStudentService } from "@/lib/satisfaction/studentService";
import SatisfactionSurveyModal from "./SatisfactionSurveyModal";

interface Props {
  targetType: string;
  targetId: number;
  isCompleted: boolean;
}

export default function SatisfactionSurveyTrigger({ targetType, targetId, isCompleted }: Props) {
  const [pendingSurvey, setPendingSurvey] = useState<PendingSurveyResponseDTO | null>(null);

  useEffect(() => {
    // Solo disparar si el objetivo está completado
    if (!isCompleted) return;

    // Disparo no bloqueante: la falla no interrumpe nada más
    const checkSurvey = async () => {
      try {
        const survey = await satisfactionStudentService.getPendingSurvey(targetType, targetId);
        if (survey) {
          setPendingSurvey(survey);
        }
      } catch (error) {
        // Fallo silencioso (zero-regression)
        console.error("Survey check failed silently:", error);
      }
    };

    // Pequeño delay para no pisar animaciones de XP
    const timer = setTimeout(() => {
      checkSurvey();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isCompleted, targetType, targetId]);

  if (!pendingSurvey) return null;

  return (
    <SatisfactionSurveyModal 
      survey={pendingSurvey} 
      onClose={() => setPendingSurvey(null)} 
      onSubmitted={() => setPendingSurvey(null)}
    />
  );
}
