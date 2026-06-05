export type SkillPathDifficulty = "BASICO" | "INTERMEDIO" | "AVANZADO";

export type SkillPathStatus =
    | "DISPONIBLE"
    | "EN_PROGRESO"
    | "COMPLETADO"
    | "CERTIFICADO_PENDIENTE"
    | "VALIDACION_PENDIENTE"
    | "VALIDADO"
    | "RECHAZADO";

export type SkillPathEvidenceStatus =
    | "SIN_EVIDENCIA"
    | "PENDIENTE"
    | "VALIDO"
    | "RECHAZADO";

export interface SkillPathSkill {
    id: string;
    name: string;
}

export interface SkillPathEvidence {
    id: string;
    fileName: string;
    fileUrl?: string;
    status: SkillPathEvidenceStatus;
    uploadedAt?: string;
    reviewedAt?: string;
    reviewerComment?: string;
}

export interface SkillPathReward {
    xpAwarded: number;
    badgeName: string;
    badgeDescription: string;
    awardedAt?: string;
}

export interface SkillPath {
    id: string;

    areaId: string;
    areaName: string;

    subareaId: string;
    subareaName: string;

    title: string;
    platform: string;
    description: string;

    difficulty: SkillPathDifficulty;
    durationLabel: string;
    xp: number;

    progressPercentage: number;
    status: SkillPathStatus;

    skills: SkillPathSkill[];

    externalUrl: string;
    isRecommended: boolean;

    evidence?: SkillPathEvidence;
    reward?: SkillPathReward;
}

export interface SkillPathFilters {
    subareaId?: string;
    search?: string;
    difficulty?: SkillPathDifficulty | "TODOS";
    status?: SkillPathStatus | "TODOS";
}