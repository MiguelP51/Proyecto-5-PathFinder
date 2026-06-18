import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Flame,
    PlayCircle,
    Sparkles,
    Target,
    Trophy,
} from "lucide-react";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getStartedStudentPathChallenges } from "@/lib/pathchallenge/student-service";
import { PathChallengeListClient } from "@/components/pathchallenge/PathChallengeListClient";

export default async function ChallengesPage() {
    const session = await getServerSession(authOptions);
    const backendJwt = (session as { backendJwt?: string } | null)?.backendJwt;

    const challenges = await getStartedStudentPathChallenges(backendJwt);

    const completedCount = challenges.filter(
        (challenge) => challenge.status === "COMPLETADO",
    ).length;

    const inProgressCount = challenges.filter(
        (challenge) => challenge.status === "EN_PROGRESO",
    ).length;

    const earnedXp = challenges
        .filter((challenge) => challenge.status === "COMPLETADO")
        .reduce((sum, challenge) => sum + challenge.xp, 0);

    const totalTasks = challenges.reduce(
        (sum, challenge) => sum + challenge.totalTasksCount,
        0,
    );

    const completedTasks = challenges.reduce(
        (sum, challenge) => sum + challenge.completedTasksCount,
        0,
    );

    return (
        <main className="min-h-screen bg-slate-50">
            <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                <div className="mb-6">
                    <Link
                        href="/user/app/exploracion/dashboard"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#7447D7]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al dashboard
                    </Link>
                </div>

                <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#7447D7] to-[#D43EE6] p-8 text-white shadow-sm">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium">
                                <Sparkles className="h-4 w-4" />
                                Misiones prácticas
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                                Mis PathChallenges
                            </h1>

                            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/85 lg:text-base">
                                Continúa tus misiones prácticas, completa tareas, entrega tus
                                soluciones y suma XP aplicando tus habilidades en escenarios
                                reales.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                            <div className="rounded-xl bg-white/15 p-4">
                                <Target className="mb-2 h-5 w-5" />
                                <p className="text-2xl font-bold">{challenges.length}</p>
                                <p className="text-xs text-white/80">Misiones</p>
                            </div>

                            <div className="rounded-xl bg-white/15 p-4">
                                <Trophy className="mb-2 h-5 w-5" />
                                <p className="text-2xl font-bold">{earnedXp}</p>
                                <p className="text-xs text-white/80">XP ganados</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-2xl font-bold text-[#7447D7]">
                            {challenges.length}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">Total Challenges</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="flex items-center gap-2 text-2xl font-bold text-purple-600">
                            <PlayCircle className="h-6 w-6" />
                            {inProgressCount}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">En progreso</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="flex items-center gap-2 text-2xl font-bold text-emerald-600">
                            <CheckCircle2 className="h-6 w-6" />
                            {completedCount}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">Completados</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="flex items-center gap-2 text-2xl font-bold text-orange-600">
                            <Flame className="h-6 w-6" />
                            {completedTasks}/{totalTasks}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">Tareas realizadas</p>
                    </div>
                </div>

                <div className="mb-6 flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-slate-900">
                        Tus misiones activas
                    </h2>

                    <p className="max-w-3xl text-sm leading-6 text-slate-600">
                        Aquí aparecerán los PathChallenges que hayas iniciado desde una
                        subárea. Puedes continuar los que están en progreso o revisar los que
                        ya completaste.
                    </p>
                </div>

                <PathChallengeListClient challenges={challenges} />
            </section>
        </main>
    );
}