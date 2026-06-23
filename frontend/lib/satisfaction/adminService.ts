import { apiFetch } from '@/lib/api';

export interface SatisfactionQuestionDTO {
  idQuestion?: number;
  questionText: string;
  questionType: string;
  isMandatory: boolean;
  orderIndex: number;
  section: string; // 'MENTOR' or 'SKILLPATH_CHALLENGE'
}

export interface SatisfactionSurveyRequestDTO {
  title: string;
  status: string; // 'DRAFT', 'ACTIVE', 'HISTORICAL'
  questions: SatisfactionQuestionDTO[];
}

export interface SatisfactionSurveyResponseDTO extends SatisfactionSurveyRequestDTO {
  idSurvey: number;
}

export interface SatisfactionAnswerResponseDTO {
  questionText: string;
  questionType: string;
  section: string;
  ratingValue?: number;
  textValue?: string;
}

export interface SatisfactionSubmissionResponseDTO {
  idSubmission: number;
  studentName: string;
  studentEmail: string;
  surveyTitle: string;
  submittedAt: string;
  answers: SatisfactionAnswerResponseDTO[];
}

export const satisfactionAdminService = {
  getAll: async (token?: string | null): Promise<SatisfactionSurveyResponseDTO[]> => {
    return await apiFetch<SatisfactionSurveyResponseDTO[]>('/api/admin/satisfaction/surveys', { method: 'GET' }, token);
  },

  getById: async (id: number, token?: string | null): Promise<SatisfactionSurveyResponseDTO> => {
    return await apiFetch<SatisfactionSurveyResponseDTO>(`/api/admin/satisfaction/surveys/${id}`, { method: 'GET' }, token);
  },

  create: async (payload: SatisfactionSurveyRequestDTO, token?: string | null): Promise<SatisfactionSurveyResponseDTO> => {
    return await apiFetch<SatisfactionSurveyResponseDTO>('/api/admin/satisfaction/surveys', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token);
  },

  update: async (id: number, payload: SatisfactionSurveyRequestDTO, token?: string | null): Promise<SatisfactionSurveyResponseDTO> => {
    return await apiFetch<SatisfactionSurveyResponseDTO>(`/api/admin/satisfaction/surveys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }, token);
  },

  getAllSubmissions: async (token?: string | null): Promise<SatisfactionSubmissionResponseDTO[]> => {
    return await apiFetch<SatisfactionSubmissionResponseDTO[]>('/api/admin/satisfaction/surveys/submissions', { method: 'GET' }, token);
  },

  getSubmissionById: async (id: number, token?: string | null): Promise<SatisfactionSubmissionResponseDTO> => {
    return await apiFetch<SatisfactionSubmissionResponseDTO>(`/api/admin/satisfaction/surveys/submissions/${id}`, { method: 'GET' }, token);
  }
};
