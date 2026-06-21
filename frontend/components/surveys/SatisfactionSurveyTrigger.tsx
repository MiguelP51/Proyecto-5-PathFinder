"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PendingSurveyResponseDTO, satisfactionStudentService } from "@/lib/satisfaction/studentService";
import SatisfactionSurveyModal from "./SatisfactionSurveyModal";

interface Props {
  isCompleted: boolean;
}

export default function SatisfactionSurveyTrigger({ isCompleted }: Props) {
  const { data: session } = useSession();
  const [pendingSurvey, setPendingSurvey] = useState<PendingSurveyResponseDTO | null>(null);

  useEffect(() => {
    if (!isCompleted) return;

    const checkSurvey = async () => {
      try {
        const survey = await satisfactionStudentService.getPendingSurvey(session?.backendJwt);
        if (survey) {
          setPendingSurvey(survey);
        }
      } catch (error) {
        console.error("Survey check failed silently:", error);
      }
    };

    const timer = setTimeout(() => {
      checkSurvey();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isCompleted, session]);

  if (!pendingSurvey) return null;

  return (
    <SatisfactionSurveyModal 
      survey={pendingSurvey} 
      onClose={() => setPendingSurvey(null)} 
      onSubmitted={() => setPendingSurvey(null)}
    />
  );
}
