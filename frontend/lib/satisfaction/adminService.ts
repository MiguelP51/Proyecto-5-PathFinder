import { apiFetch } from '@/lib/api';

export interface SatisfactionQuestionDTO {
  idQuestion?: number;
  questionText: string;
  questionType: string;
  isMandatory: boolean;
  orderIndex: number;
}

export interface SatisfactionSurveyRequestDTO {
  title: string;
  targetType: string; // 'CHALLENGE' or 'SKILLPATH'
  targetId?: number; // Optional
  status: string; // 'DRAFT', 'ACTIVE', 'ARCHIVED'
  questions: SatisfactionQuestionDTO[];
}

export interface SatisfactionSurveyResponseDTO extends SatisfactionSurveyRequestDTO {
  idSurvey: number;
}

export const satisfactionAdminService = {
  getAll: async (): Promise<SatisfactionSurveyResponseDTO[]> => {
    return await apiFetch<SatisfactionSurveyResponseDTO[]>('/api/admin/satisfaction/surveys', { method: 'GET' });
  },

  getById: async (id: number): Promise<SatisfactionSurveyResponseDTO> => {
    return await apiFetch<SatisfactionSurveyResponseDTO>(`/api/admin/satisfaction/surveys/${id}`, { method: 'GET' });
  },

  create: async (payload: SatisfactionSurveyRequestDTO): Promise<SatisfactionSurveyResponseDTO> => {
    return await apiFetch<SatisfactionSurveyResponseDTO>('/api/admin/satisfaction/surveys', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  update: async (id: number, payload: SatisfactionSurveyRequestDTO): Promise<SatisfactionSurveyResponseDTO> => {
    return await apiFetch<SatisfactionSurveyResponseDTO>(`/api/admin/satisfaction/surveys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }
};
