import { CheckCircle2, Clock, FileText, XCircle } from "lucide-react";

import { SkillPath } from "@/lib/skillpath/types";

interface SkillPathStatusSummaryProps {
    skillPath: SkillPath;
}

function getEvidenceLabel(skillPath: SkillPath) {
    if (!skillPath.evidence) {
        return "Sin evidencia";
    }

    switch (skillPath.evidence.status) {
        case "PENDIENTE":
            return "Evidencia enviada";
        case "VALIDO":
            return "Evidencia aprobada";
        case "RECHAZADO":
            return "Evidencia rechazada";
        default:
            return "Sin evidencia";
    }
}

function getValidationLabel(skillPath: SkillPath) {
    switch (skillPath.status) {
        case "VALIDADO":
        case "COMPLETADO":
            return "Validación aprobada";
        case "VALIDACION_PENDIENTE":
            return "Validación pendiente";
        case "RECHAZADO":
            return "Validación rechazada";
        default:
            return "Pendiente de evidencia";
    }
}

function getStartedLabel(skillPath: SkillPath) {
    return skillPath.status === "DISPONIBLE"
        ? "No iniciado"
        : "Recurso iniciado";
}

export function SkillPathStatusSummary({
                                           skillPath,
                                       }: SkillPathStatusSummaryProps) {
    const isStarted = skillPath.status !== "DISPONIBLE";
    const hasEvidence = Boolean(skillPath.evidence);
    const isValidated =
        skillPath.status === "VALIDADO" || skillPath.status === "COMPLETADO";
    const isRejected = skillPath.status === "RECHAZADO";

    return (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-950">
                    Estado del SkillPath
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    PathFinder registra tu avance dentro de la plataforma, no el progreso
                    interno del curso externo.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <div
                            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                isStarted
                                    ? "bg-emerald-100 text-emerald-600"
                                    : "bg-slate-200 text-slate-500"
                            }`}
                        >
                            {isStarted ? (
                                <CheckCircle2 className="h-5 w-5" />
                            ) : (
                                <Clock className="h-5 w-5" />
                            )}
                        </div>

                        <p className="text-sm font-semibold text-slate-900">
                            Recurso externo
                        </p>
                    </div>

                    <p className="text-sm text-slate-600">{getStartedLabel(skillPath)}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <div
                            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                hasEvidence
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-slate-200 text-slate-500"
                            }`}
                        >
                            <FileText className="h-5 w-5" />
                        </div>

                        <p className="text-sm font-semibold text-slate-900">
                            Certificado
                        </p>
                    </div>

                    <p className="text-sm text-slate-600">{getEvidenceLabel(skillPath)}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <div
                            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                isValidated
                                    ? "bg-emerald-100 text-emerald-600"
                                    : isRejected
                                        ? "bg-red-100 text-red-600"
                                        : "bg-yellow-100 text-yellow-600"
                            }`}
                        >
                            {isRejected ? (
                                <XCircle className="h-5 w-5" />
                            ) : isValidated ? (
                                <CheckCircle2 className="h-5 w-5" />
                            ) : (
                                <Clock className="h-5 w-5" />
                            )}
                        </div>

                        <p className="text-sm font-semibold text-slate-900">
                            Validación
                        </p>
                    </div>

                    <p className="text-sm text-slate-600">
                        {getValidationLabel(skillPath)}
                    </p>
                </div>
            </div>
        </section>
    );
}