import { apiFetch } from '@/lib/api';
import { SatisfactionQuestionDTO } from './adminService';

export interface PendingSurveyResponseDTO {
  idSurvey: number;
  title: string;
  targetType: string;
  targetId?: number;
  questions: SatisfactionQuestionDTO[];
}

export interface SubmitAnswerRequestDTO {
  questionId: number;
  ratingValue?: number;
  textValue?: string;
}

export interface SubmitSurveyRequestDTO {
  surveyId: number;
  targetId: number;
  answers: SubmitAnswerRequestDTO[];
}

export const satisfactionStudentService = {
  getPendingSurvey: async (targetType: string, targetId?: number): Promise<PendingSurveyResponseDTO | null> => {
    try {
      let url = `/api/student/satisfaction/pending?targetType=${targetType}`;
      if (targetId) {
        url += `&targetId=${targetId}`;
      }
      return await apiFetch<PendingSurveyResponseDTO>(url, { method: 'GET' });
    } catch (e) {
      return null;
    }
  },

  submitSurvey: async (payload: SubmitSurveyRequestDTO): Promise<void> => {
    await apiFetch('/api/student/satisfaction/submissions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
