import Link from "next/link";
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    PlayCircle,
    Target,
    Trophy,
    Zap,
} from "lucide-react";

import { StudentPathChallenge } from "@/lib/pathchallenge/student-types";

interface PathChallengeCardProps {
    challenge: StudentPathChallenge;
}

const statusLabel: Record<string, string> = {
    DISPONIBLE: "Disponible",
    EN_PROGRESO: "En progreso",
    COMPLETADO: "Completado",
};

const statusClass: Record<string, string> = {
    DISPONIBLE: "bg-slate-100 text-slate-600",
    EN_PROGRESO: "bg-purple-100 text-purple-700",
    COMPLETADO: "bg-emerald-100 text-emerald-700",
};

function getDifficultyClass(difficulty: string) {
    const value = difficulty?.toLowerCase() ?? "";

    if (
        value.includes("fácil") ||
        value.includes("facil") ||
        value.includes("básico") ||
        value.includes("basico")
    ) {
        return "bg-emerald-100 text-emerald-700";
    }

    if (
        value.includes("difícil") ||
        value.includes("dificil") ||
        value.includes("avanzado")
    ) {
        return "bg-red-100 text-red-700";
    }

    return "bg-amber-100 text-amber-700";
}

function getActionLabel(status: string) {
    if (status === "COMPLETADO") return "Revisar misión";
    if (status === "EN_PROGRESO") return "Continuar misión";
    return "Ver misión";
}

export function PathChallengeCard({ challenge }: PathChallengeCardProps) {
    const detailHref = `/user/app/challenges/${challenge.idPathChallenge}`;

    return (
        <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-[#7447D7]">
                    {challenge.status === "COMPLETADO" ? (
                        <CheckCircle2 className="h-6 w-6" />
                    ) : challenge.status === "EN_PROGRESO" ? (
                        <PlayCircle className="h-6 w-6" />
                    ) : (
                        <Target className="h-6 w-6" />
                    )}
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                        statusClass[challenge.status] ?? "bg-slate-100 text-slate-600"
                    }`}
                >
          {statusLabel[challenge.status] ?? challenge.status}
        </span>
            </div>

            <h3 className="line-clamp-2 text-lg font-bold text-slate-950">
                {challenge.title}
            </h3>

            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                {challenge.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
        <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${getDifficultyClass(
                challenge.difficulty,
            )}`}
        >
          {challenge.difficulty}
        </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          <Clock className="h-3.5 w-3.5" />
                    {challenge.durationLabel}
        </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
          <Zap className="h-3.5 w-3.5" />
                    {challenge.xp} XP
        </span>
            </div>

            {challenge.skills?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {challenge.skills.slice(0, 4).map((skill) => (
                        <span
                            key={skill.id}
                            className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700"
                        >
              {skill.name}
            </span>
                    ))}
                </div>
            )}

            <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Progreso</span>
                    <span>{challenge.progressPercentage}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-[#7447D7]"
                        style={{ width: `${challenge.progressPercentage}%` }}
                    />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                    {challenge.completedTasksCount}/{challenge.totalTasksCount} tareas
                    completadas
                </p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    {challenge.xp} puntos
                </div>

                <Link
                    href={detailHref}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#7447D7] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#6036c4]"
                >
                    {getActionLabel(challenge.status)}
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </article>
    );
}