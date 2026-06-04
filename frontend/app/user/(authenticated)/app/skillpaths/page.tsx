import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, Sparkles } from "lucide-react";

import { SkillPathCard } from "@/components/skillpath/SkillPathCard";
import { getSkillPaths } from "@/lib/skillpath/service";

interface SkillPathsPageProps {
    searchParams?: Promise<{
        subareaId?: string;
    }>;
}

export default async function SkillPathsPage({
                                                 searchParams,
                                             }: SkillPathsPageProps) {
    const resolvedSearchParams = await searchParams;
    const subareaId = resolvedSearchParams?.subareaId;

    const skillPaths = await getSkillPaths({
        subareaId,
    });

    const isSubareaView = Boolean(subareaId);
    const currentSubareaName = skillPaths[0]?.subareaName;

    const totalXp = skillPaths.reduce(
        (total, skillPath) => total + skillPath.xp,
        0,
    );

    const completedCount = skillPaths.filter(
        (skillPath) =>
            skillPath.status === "COMPLETADO" || skillPath.status === "VALIDADO",
    ).length;

    const inProgressCount = skillPaths.filter(
        (skillPath) => skillPath.status === "EN_PROGRESO",
    ).length;

    const pendingCertificateCount = skillPaths.filter(
        (skillPath) =>
            skillPath.status === "CERTIFICADO_PENDIENTE" ||
            skillPath.status === "VALIDACION_PENDIENTE",
    ).length;

    const pageTitle = isSubareaView
        ? `SkillPaths para ${currentSubareaName ?? "esta subárea"}`
        : "Mis SkillPaths";

    const pageDescription = isSubareaView
        ? `Explora cursos y recursos externos recomendados para fortalecer tus habilidades en ${
            currentSubareaName ?? "la subárea seleccionada"
        }.`
        : "Revisa tus rutas de aprendizaje, cursos en progreso, certificados pendientes y recursos disponibles dentro de PathFinder.";

    return (
        <main className="min-h-screen bg-slate-50">
            <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                <div className="mb-6">
                    <Link
                        href="/user/app/exploracion-intro"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#7447D7]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al entrenamiento
                    </Link>
                </div>

                <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#7447D7] to-[#9D7BFF] p-8 text-white shadow-sm">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium">
                                <Sparkles className="h-4 w-4" />
                                {isSubareaView ? "Recomendaciones por subárea" : "Centro de aprendizaje"}
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                                {pageTitle}
                            </h1>

                            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/85 lg:text-base">
                                {pageDescription} Completa recursos, sube tu evidencia y suma XP
                                a tu progreso profesional.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                            <div className="rounded-xl bg-white/15 p-4">
                                <BookOpen className="mb-2 h-5 w-5" />
                                <p className="text-2xl font-bold">{skillPaths.length}</p>
                                <p className="text-xs text-white/80">Recursos</p>
                            </div>

                            <div className="rounded-xl bg-white/15 p-4">
                                <GraduationCap className="mb-2 h-5 w-5" />
                                <p className="text-2xl font-bold">{totalXp}</p>
                                <p className="text-xs text-white/80">XP disponibles</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-2xl font-bold text-[#7447D7]">
                            {skillPaths.length}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">Total SkillPaths</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-2xl font-bold text-emerald-600">
                            {completedCount}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">Completados</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-2xl font-bold text-purple-600">
                            {inProgressCount}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">En progreso</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-2xl font-bold text-orange-600">
                            {pendingCertificateCount}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                            Certificado pendiente
                        </p>
                    </div>
                </div>

                <div className="mb-6 flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {isSubareaView
                            ? "SkillPaths recomendados"
                            : "Tus SkillPaths disponibles"}
                    </h2>

                    <p className="max-w-3xl text-sm leading-6 text-slate-600">
                        {isSubareaView
                            ? "Estos recursos están asociados a la subárea seleccionada y te ayudarán a reforzar habilidades específicas."
                            : "Aquí encontrarás tus recursos recomendados, rutas iniciadas, cursos completados y certificados pendientes de validación."}
                    </p>
                </div>

                {skillPaths.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {skillPaths.map((skillPath) => (
                            <SkillPathCard key={skillPath.id} skillPath={skillPath} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <h3 className="text-lg font-semibold text-slate-900">
                            No hay SkillPaths disponibles
                        </h3>

                        <p className="mt-2 text-sm text-slate-600">
                            Aún no existen recursos configurados para esta subárea. Intenta
                            volver más tarde o revisa otra ruta de entrenamiento.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}