import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { SkillPathEvidenceSection } from "@/components/skillpath/SkillPathEvidenceSection";
import { SkillPathRewardSummary } from "@/components/skillpath/SkillPathRewardSummary";
import { SkillPathStatusSummary } from "@/components/skillpath/SkillPathStatusSummary";

import {
    ArrowLeft,
    Award,
    BookOpen,
    CheckCircle2,
    Clock,
    ExternalLink,
    Layers,
    TrendingUp,
} from "lucide-react";

import { getSkillPathById } from "@/lib/skillpath/service";
import {
    getSkillPathDifficultyClasses,
    getSkillPathDifficultyLabel,
    getSkillPathStatusClasses,
    getSkillPathStatusLabel,
} from "@/lib/skillpath/display";

interface SkillPathDetailPageProps {
    params: Promise<{
        skillPathId: string;
    }>;

    // CAMBIO: ahora recibimos searchParams para leer ?returnTo=...
    searchParams?: Promise<{
        returnTo?: string;
    }>;
}

export default async function SkillPathDetailPage({
                                                      params,
                                                      searchParams, // CAMBIO
                                                  }: SkillPathDetailPageProps) {
    const { skillPathId } = await params;

    // CAMBIO: definimos a dónde debe regresar el botón superior.
    // Si viene desde el dashboard de subárea, usa returnTo.
    // Si no viene returnTo, vuelve al dashboard general de SkillPaths.
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const returnTo = resolvedSearchParams.returnTo ?? "/user/app/skillpaths";

    const returnLabel = returnTo.startsWith("/areas/")
        ? "Volver a la subárea"
        : "Volver a SkillPaths";

    const session = await getServerSession(authOptions);
    const backendJwt = (session as { backendJwt?: string } | null)?.backendJwt;

    const skillPath = await getSkillPathById(skillPathId, backendJwt);

    if (!skillPath) {
        notFound();
    }

    const hasSkills = skillPath.skills.length > 0;

    return (
        <main className="min-h-screen bg-slate-50">
            <section className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
                <div className="mb-6">
                    <Link
                        // CAMBIO: antes iba a /user/app/skillpaths?subareaId=...
                        // Ahora usa returnTo para volver al lugar correcto.
                        href={returnTo}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#7447D7]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {returnLabel}
                    </Link>
                </div>

                <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-5">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-[#7447D7]">
                                <BookOpen className="h-8 w-8" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-[#7447D7]">
                                    {skillPath.platform}
                                </p>

                                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 lg:text-4xl">
                                    {skillPath.title}
                                </h1>

                                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                                    {skillPath.description}
                                </p>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getSkillPathDifficultyClasses(
                                            skillPath.difficulty,
                                        )}`}
                                    >
                                        {getSkillPathDifficultyLabel(skillPath.difficulty)}
                                    </span>

                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getSkillPathStatusClasses(
                                            skillPath.status,
                                        )}`}
                                    >
                                        {getSkillPathStatusLabel(skillPath.status)}
                                    </span>

                                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                        {skillPath.subareaName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                            <Clock className="h-5 w-5" />
                        </div>

                        <p className="text-sm text-slate-500">Duración</p>
                        <p className="mt-1 text-lg font-bold text-slate-950">
                            {skillPath.durationLabel}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                            <Award className="h-5 w-5" />
                        </div>

                        <p className="text-sm text-slate-500">Recompensa</p>
                        <p className="mt-1 text-lg font-bold text-slate-950">
                            {skillPath.xp} XP
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-[#7447D7]">
                            <TrendingUp className="h-5 w-5" />
                        </div>

                        <p className="text-sm text-slate-500">Nivel</p>
                        <p className="mt-1 text-lg font-bold text-slate-950">
                            {getSkillPathDifficultyLabel(skillPath.difficulty)}
                        </p>
                    </div>
                </section>

                <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>

                        <h2 className="text-lg font-bold text-slate-950">
                            ¿Cómo funciona?
                        </h2>
                    </div>

                    <ol className="space-y-3 text-sm leading-6 text-slate-600">
                        <li>
                            <span className="font-semibold text-[#7447D7]">1.</span> Revisa
                            la información del SkillPath y abre el recurso externo desde esta
                            página.
                        </li>
                        <li>
                            <span className="font-semibold text-[#7447D7]">2.</span> Completa
                            el curso o actividad en la plataforma correspondiente.
                        </li>
                        <li>
                            <span className="font-semibold text-[#7447D7]">3.</span> Descarga
                            tu certificado o evidencia de finalización.
                        </li>
                        <li>
                            <span className="font-semibold text-[#7447D7]">4.</span> Regresa
                            a PathFinder y sube el archivo en formato PDF.
                        </li>
                        <li>
                            <span className="font-semibold text-[#7447D7]">5.</span> Cuando la
                            evidencia sea validada, se actualizarán tu XP e insignias.
                        </li>
                    </ol>
                </section>

                <SkillPathStatusSummary skillPath={skillPath} />

                {hasSkills && (
                    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                <Layers className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-slate-950">
                                    Habilidades que desarrollarás
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Al completar este SkillPath, fortalecerás estas habilidades.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {skillPath.skills.map((skill) => (
                                <span
                                    key={skill.id}
                                    className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                                >
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                <section className="mb-6 rounded-2xl border border-purple-200 bg-purple-50 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-950">
                        Continúa tu aprendizaje
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        Accede al recurso externo, completa el curso en la plataforma
                        correspondiente y regresa a PathFinder para subir tu certificado o
                        evidencia.
                    </p>

                    <div className="mt-5">
                        <a
                            href={skillPath.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#7447D7] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6036c2]"
                        >
                            Continuar en {skillPath.platform}
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                </section>

                <SkillPathEvidenceSection
                    skillPathId={skillPath.id}
                    initialEvidence={skillPath.evidence}
                />

                <SkillPathRewardSummary skillPath={skillPath} />
            </section>
        </main>
    );
}