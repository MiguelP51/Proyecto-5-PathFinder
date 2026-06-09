import {
    SkillPathDifficulty,
    SkillPathEvidenceStatus,
    SkillPathStatus,
} from "./types";

export function getSkillPathDifficultyLabel(
    difficulty: SkillPathDifficulty,
): string {
    const labels: Record<SkillPathDifficulty, string> = {
        BASICO: "Básico",
        INTERMEDIO: "Intermedio",
        AVANZADO: "Avanzado",
    };

    return labels[difficulty];
}

export function getSkillPathDifficultyClasses(
    difficulty: SkillPathDifficulty,
): string {
    const classes: Record<SkillPathDifficulty, string> = {
        BASICO: "bg-emerald-100 text-emerald-700 border-emerald-200",
        INTERMEDIO: "bg-yellow-100 text-yellow-700 border-yellow-200",
        AVANZADO: "bg-red-100 text-red-700 border-red-200",
    };

    return classes[difficulty];
}

export function getSkillPathStatusLabel(status: SkillPathStatus): string {
    const labels: Record<SkillPathStatus, string> = {
        DISPONIBLE: "Disponible",
        EN_PROGRESO: "En progreso",
        COMPLETADO: "Completado",
        CERTIFICADO_PENDIENTE: "Certificado pendiente",
        VALIDACION_PENDIENTE: "Validación pendiente",
        VALIDADO: "Validado",
        RECHAZADO: "Rechazado",
    };

    return labels[status];
}

export function getSkillPathStatusClasses(status: SkillPathStatus): string {
    const classes: Record<SkillPathStatus, string> = {
        DISPONIBLE: "bg-blue-100 text-blue-700 border-blue-200",
        EN_PROGRESO: "bg-purple-100 text-[#7447D7] border-purple-200",
        COMPLETADO: "bg-emerald-100 text-emerald-700 border-emerald-200",
        CERTIFICADO_PENDIENTE: "bg-orange-100 text-orange-700 border-orange-200",
        VALIDACION_PENDIENTE: "bg-yellow-100 text-yellow-700 border-yellow-200",
        VALIDADO: "bg-emerald-100 text-emerald-700 border-emerald-200",
        RECHAZADO: "bg-red-100 text-red-700 border-red-200",
    };

    return classes[status];
}

export function getSkillPathEvidenceStatusLabel(
    status: SkillPathEvidenceStatus,
): string {
    const labels: Record<SkillPathEvidenceStatus, string> = {
        SIN_EVIDENCIA: "Sin evidencia",
        PENDIENTE: "Pendiente de validación",
        VALIDO: "Evidencia validada",
        RECHAZADO: "Evidencia rechazada",
    };

    return labels[status];
}

export function getSkillPathEvidenceStatusClasses(
    status: SkillPathEvidenceStatus,
): string {
    const classes: Record<SkillPathEvidenceStatus, string> = {
        SIN_EVIDENCIA: "bg-slate-100 text-slate-600 border-slate-200",
        PENDIENTE: "bg-yellow-100 text-yellow-700 border-yellow-200",
        VALIDO: "bg-emerald-100 text-emerald-700 border-emerald-200",
        RECHAZADO: "bg-red-100 text-red-700 border-red-200",
    };

    return classes[status];
}

export function getSkillPathProgressLabel(progressPercentage: number): string {
    if (progressPercentage <= 0) {
        return "Sin iniciar";
    }

    if (progressPercentage >= 100) {
        return "Completado";
    }

    return `${progressPercentage}% completado`;
}

export function getSkillPathActionLabel(status: SkillPathStatus): string {
    const labels: Record<SkillPathStatus, string> = {
        DISPONIBLE: "Iniciar SkillPath",
        EN_PROGRESO: "Continuar SkillPath",
        COMPLETADO: "Ver detalle",
        CERTIFICADO_PENDIENTE: "Subir certificado",
        VALIDACION_PENDIENTE: "Ver validación",
        VALIDADO: "Ver certificado",
        RECHAZADO: "Reemplazar evidencia",
    };

    return labels[status];
}