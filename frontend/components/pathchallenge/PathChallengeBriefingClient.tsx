"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Clock,
    FileText,
    Loader2,
    PlayCircle,
    Sparkles,
    Target,
    Trophy,
    Zap,
} from "lucide-react";

import { startStudentPathChallenge } from "@/lib/pathchallenge/student-service";
import { StudentPathChallenge } from "@/lib/pathchallenge/student-types";

interface PathChallengeBriefingClientProps {
    challenge: StudentPathChallenge;
    backHref?: string;
    backLabel?: string;
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

function getSessionToken(session: unknown): string | null {
    const typedSession = session as
        | {
        backendJwt?: string;
        accessToken?: string;
        user?: {
            backendJwt?: string;
            accessToken?: string;
        };
    }
        | null
        | undefined;

    return (
        typedSession?.backendJwt ??
        typedSession?.user?.backendJwt ??
        typedSession?.accessToken ??
        typedSession?.user?.accessToken ??
        null
    );
}

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

export function PathChallengeBriefingClient({
                                                challenge,
                                                backHref = "/user/app/challenges",
                                                backLabel = "Volver a Challenges",
                                            }: PathChallengeBriefingClientProps) {
    const router = useRouter();
    const { data: session } = useSession();

    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const token = getSessionToken(session);

    const isCompleted = challenge.status === "COMPLETADO";
    const isInProgress = challenge.status === "EN_PROGRESO";

    const actionLabel = isCompleted
        ? "Revisar misión"
        : isInProgress
            ? "Continuar misión"
            : "Comenzar misión";

    const actionIcon = isCompleted ? (
        <CheckCircle2 className="h-4 w-4" />
    ) : isInProgress ? (
        <ArrowRight className="h-4 w-4" />
    ) : (
        <PlayCircle className="h-4 w-4" />
    );

    const goToMissionFlow = () => {
        router.push(`/user/app/challenges/${challenge.idPathChallenge}/realizar`);
    };

    const handleStart = async () => {
        setError(null);

        if (challenge.status !== "DISPONIBLE") {
            goToMissionFlow();
            return;
        }

        if (!token) {
            setError("No se encontró una sesión válida. Vuelve a iniciar sesión.");
            return;
        }

        setStarting(true);

        try {
            await startStudentPathChallenge(challenge.idPathChallenge, token);
            goToMissionFlow();
        } catch (err) {
            console.error(err);
            setError("No se pudo iniciar la misión. Intenta nuevamente.");
        } finally {
            setStarting(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <section className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
                <div className="mb-6">
                    <Link
                        href={backHref}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#7447D7]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {backLabel}
                    </Link>
                </div>

                <div className="mb-6 overflow-hidden rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="mb-4 flex flex-wrap gap-2">
                <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                        statusClass[challenge.status] ?? "bg-slate-100 text-slate-600"
                    }`}
                >
                  {statusLabel[challenge.status] ?? challenge.status}
                </span>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold ${getDifficultyClass(
                                        challenge.difficulty,
                                    )}`}
                                >
                  {challenge.difficulty}
                </span>
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-950 lg:text-4xl">
                                {challenge.title}
                            </h1>

                            <p className="mt-3 text-base leading-7 text-slate-600">
                                {challenge.description}
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[430px]">
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <Clock className="mb-2 h-5 w-5 text-[#7447D7]" />
                                <p className="text-xs font-medium text-slate-500">
                                    Tiempo estimado
                                </p>
                                <p className="font-bold text-slate-950">
                                    {challenge.durationLabel}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                                <Zap className="mb-2 h-5 w-5 text-orange-500" />
                                <p className="text-xs font-medium text-slate-500">
                                    Recompensa
                                </p>
                                <p className="font-bold text-slate-950">{challenge.xp} XP</p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                                <Target className="mb-2 h-5 w-5 text-emerald-500" />
                                <p className="text-xs font-medium text-slate-500">Progreso</p>
                                <p className="font-bold text-slate-950">
                                    {challenge.progressPercentage}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
                            <span>Avance actual</span>
                            <span>
                {challenge.completedTasksCount}/{challenge.totalTasksCount} tareas
              </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-[#7447D7]"
                                style={{ width: `${challenge.progressPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {challenge.skills.length > 0 && (
                    <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <h2 className="text-lg font-bold text-slate-950">
                            Habilidades que practicarás
                        </h2>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {challenge.skills.map((skill) => (
                                <span
                                    key={skill.id}
                                    className="rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700"
                                >
                  {skill.name}
                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="space-y-6">
                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                            <div className="mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#7447D7]" />
                                <h2 className="text-lg font-bold text-slate-950">
                                    Briefing de la misión
                                </h2>
                            </div>

                            <p className="text-sm leading-7 text-slate-600">
                                En esta misión aplicarás tus habilidades mediante un reto
                                práctico. Primero revisa las indicaciones, luego comienza la
                                misión para completar las tareas y registrar tu entrega.
                            </p>

                            {challenge.subareaName && (
                                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                                    <p className="text-sm font-bold text-slate-950">
                                        Subárea asociada
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {challenge.subareaName}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                            <h2 className="text-lg font-bold text-slate-950">
                                Qué harás en esta misión
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Estas son las tareas principales que deberás completar durante
                                el flujo práctico.
                            </p>

                            <div className="mt-5 space-y-3">
                                {challenge.tasks.length > 0 ? (
                                    challenge.tasks.map((task) => (
                                        <div
                                            key={task.idPathChallengeTask}
                                            className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-[#7447D7]">
                                                {task.order}
                                            </div>

                                            <div>
                                                <p className="font-semibold text-slate-950">
                                                    Tarea {task.order}
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                                    {task.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                                        Esta misión aún no tiene tareas configuradas.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-[#7447D7]">
                                <Sparkles className="h-6 w-6" />
                            </div>

                            <h2 className="text-lg font-bold text-slate-950">
                                Antes de empezar
                            </h2>

                            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                                <li>• Revisa el objetivo general de la misión.</li>
                                <li>• Lee todas las tareas antes de comenzar.</li>
                                <li>• Podrás guardar tu avance y continuar después.</li>
                                <li>• Para finalizar, deberás completar todas las tareas.</li>
                            </ul>

                            {error && (
                                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                                    {error}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleStart}
                                disabled={starting || challenge.tasks.length === 0}
                                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7447D7] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#6036c4] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {starting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    actionIcon
                                )}
                                {actionLabel}
                            </button>
                        </div>

                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                            <div className="mb-4 flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-amber-500" />
                                <h2 className="text-lg font-bold text-slate-950">
                                    Criterios mínimos
                                </h2>
                            </div>

                            <div className="space-y-3 text-sm text-slate-600">
                                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                                    <span>Completar tareas</span>
                                    <span className="font-bold text-slate-950">100%</span>
                                </div>

                                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                                    <span>Registrar entrega</span>
                                    <span className="font-bold text-slate-950">Obligatorio</span>
                                </div>

                                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                                    <span>Recompensa</span>
                                    <span className="font-bold text-slate-950">
                    {challenge.xp} XP
                  </span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}