import { apiFetch } from '@/lib/api';
import { PathChallengeRequestDTO, PathChallengeResponseDTO } from './types';

export const pathChallengeService = {
  getAll: async (): Promise<PathChallengeResponseDTO[]> => {
    return await apiFetch<PathChallengeResponseDTO[]>('/api/admin/pathchallenges', { method: 'GET' });
  },

  getById: async (id: number): Promise<PathChallengeResponseDTO> => {
    return await apiFetch<PathChallengeResponseDTO>(`/api/admin/pathchallenges/${id}`, { method: 'GET' });
  },

  create: async (payload: PathChallengeRequestDTO): Promise<PathChallengeResponseDTO> => {
    return await apiFetch<PathChallengeResponseDTO>('/api/admin/pathchallenges', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  update: async (id: number, payload: PathChallengeRequestDTO): Promise<PathChallengeResponseDTO> => {
    return await apiFetch<PathChallengeResponseDTO>(`/api/admin/pathchallenges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiFetch(`/api/admin/pathchallenges/${id}`, { method: 'DELETE' });
  }
};
