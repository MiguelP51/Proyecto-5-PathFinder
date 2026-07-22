export interface PathChallengeTaskDTO {
  idPathChallengeTask?: number;
  descripcion: string;
  orden?: number;
  titulo?: string;
  tipoTarea?: string;
  contenido?: string;
  opcionesJson?: string;
  opciones?: string[];
  obligatoria?: boolean;
  configJson?: string;
}

export interface PathChallengeRequestDTO {
  titulo: string;
  dificultad: string;
  xp: number;
  estado: string;
  subareaId: number;
  habilidadesIds: number[];
  tareas: PathChallengeTaskDTO[];
}

export interface PathChallengeResponseDTO {
  idPathChallenge: number;
  titulo: string;
  dificultad: string;
  xp: number;
  estado: string;
  completadas: number;
  subareaId: number;
  subareaNombre: string;
  tags: string[];
  tareasCount: number;
  tareas: PathChallengeTaskDTO[];
}
