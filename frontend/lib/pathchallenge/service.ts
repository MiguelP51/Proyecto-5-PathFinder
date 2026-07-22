import { apiFetch } from '@/lib/api';
import { PathChallengeRequestDTO, PathChallengeResponseDTO, PathChallengeTaskDTO } from './types';

export const pathChallengeService = {
  getAll: async (token?: string | null): Promise<PathChallengeResponseDTO[]> => {
    return await apiFetch<PathChallengeResponseDTO[]>('/api/admin/pathchallenges', { method: 'GET' }, token);
  },

  getById: async (id: number, token?: string | null): Promise<PathChallengeResponseDTO> => {
    return await apiFetch<PathChallengeResponseDTO>(`/api/admin/pathchallenges/${id}`, { method: 'GET' }, token);
  },

  create: async (payload: PathChallengeRequestDTO, token?: string | null): Promise<PathChallengeResponseDTO> => {
    return await apiFetch<PathChallengeResponseDTO>('/api/admin/pathchallenges', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token);
  },

  update: async (id: number, payload: PathChallengeRequestDTO, token?: string | null): Promise<PathChallengeResponseDTO> => {
    return await apiFetch<PathChallengeResponseDTO>(`/api/admin/pathchallenges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }, token);
  },

  createTask: async (idPathChallenge: number, payload: PathChallengeTaskDTO, token?: string | null): Promise<PathChallengeTaskDTO> => {
    return await apiFetch<PathChallengeTaskDTO>(`/api/admin/pathchallenges/${idPathChallenge}/tasks`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token);
  },

  updateTask: async (
    idPathChallenge: number,
    idPathChallengeTask: number,
    payload: PathChallengeTaskDTO,
    token?: string | null
  ): Promise<PathChallengeTaskDTO> => {
    return await apiFetch<PathChallengeTaskDTO>(
      `/api/admin/pathchallenges/${idPathChallenge}/tasks/${idPathChallengeTask}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload)
      },
      token
    );
  },

  delete: async (id: number, token?: string | null): Promise<void> => {
    await apiFetch(`/api/admin/pathchallenges/${id}`, { method: 'DELETE' }, token);
  }
};
