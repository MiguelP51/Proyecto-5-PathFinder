import { apiFetch } from '@/lib/api';
import { SatisfactionQuestionDTO } from './adminService';

export interface PendingSurveyResponseDTO {
  idSurvey: number;
  title: string;
  questions: SatisfactionQuestionDTO[];
}

export interface SubmitAnswerRequestDTO {
  questionId: number;
  ratingValue?: number;
  textValue?: string;
}

export interface SubmitSurveyRequestDTO {
  surveyId: number;
  answers: SubmitAnswerRequestDTO[];
}

export const satisfactionStudentService = {
  getPendingSurvey: async (token?: string | null): Promise<PendingSurveyResponseDTO | null> => {
    try {
      return await apiFetch<PendingSurveyResponseDTO>('/api/student/satisfaction/pending', { method: 'GET' }, token);
    } catch (e) {
      return null;
    }
  },

  submitSurvey: async (payload: SubmitSurveyRequestDTO, token?: string | null): Promise<void> => {
    await apiFetch('/api/student/satisfaction/submissions', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token);
  }
};
