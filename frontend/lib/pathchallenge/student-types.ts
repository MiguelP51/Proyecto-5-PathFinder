export interface StudentPathChallengeSkill {
    id: string;
    name: string;
}

export interface StudentPathChallengeTask {
    idPathChallengeTask: number;
    description: string;
    order: number;
    completed: boolean;
}

export interface StudentPathChallengeSubmission {
    text?: string | null;
    fileName?: string | null;
    fileUrl?: string | null;
    updatedAt?: string | null;
    completedAt?: string | null;
}

export interface StudentPathChallengeReward {
    xpAwarded?: number | null;
    badgeName?: string | null;
    badgeDescription?: string | null;
    awardedAt?: string | null;
}

export interface StudentPathChallenge {
    id: string;
    idPathChallenge: number;

    areaId?: string | null;
    areaName?: string | null;

    subareaId?: string | null;
    subareaName?: string | null;

    title: string;
    description: string;

    difficulty: string;
    durationLabel: string;
    xp: number;

    progressPercentage: number;
    status: "DISPONIBLE" | "EN_PROGRESO" | "COMPLETADO" | string;

    completedTasksCount: number;
    totalTasksCount: number;

    skills: StudentPathChallengeSkill[];
    tasks: StudentPathChallengeTask[];

    submission?: StudentPathChallengeSubmission | null;
    reward?: StudentPathChallengeReward | null;
}

export interface StudentPathChallengeProgressRequest {
    completedTaskIds: number[];
    entregaTexto?: string;
}

export interface StudentPathChallengeFinishRequest {
    completedTaskIds: number[];
    entregaTexto?: string;
}