import { Award, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";

import { SkillPath } from "@/lib/skillpath/types";

interface SkillPathRewardSummaryProps {
    skillPath: SkillPath;
}

export function SkillPathRewardSummary({
                                           skillPath,
                                       }: SkillPathRewardSummaryProps) {
    if (skillPath.status !== "VALIDADO" && skillPath.status !== "COMPLETADO") {
        return null;
    }

    return (
        <section className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>

                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <Sparkles className="h-3.5 w-3.5" />
                            SkillPath validado
                        </div>

                        <h2 className="text-xl font-bold text-slate-950">
                            ¡Progreso actualizado correctamente!
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            La evidencia de este SkillPath fue aceptada. Tu avance se actualizó
                            al 100%, se sumó experiencia a tu perfil y se registró la
                            recompensa obtenida.
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
                    <div className="rounded-2xl border border-emerald-200 bg-white p-4">
                        <div className="mb-2 flex items-center gap-2 text-emerald-600">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs font-semibold uppercase">
                Progreso
              </span>
                        </div>

                        <p className="text-2xl font-bold text-slate-950">100%</p>
                        <p className="mt-1 text-xs text-slate-500">
                            SkillPath completado
                        </p>
                    </div>

                    <div className="rounded-2xl border border-yellow-200 bg-white p-4">
                        <div className="mb-2 flex items-center gap-2 text-yellow-600">
                            <Award className="h-4 w-4" />
                            <span className="text-xs font-semibold uppercase">
                XP ganado
              </span>
                        </div>

                        <p className="text-2xl font-bold text-slate-950">
                            +{skillPath.reward?.xpAwarded ?? skillPath.xp}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Experiencia añadida
                        </p>
                    </div>
                </div>
            </div>

            {skillPath.reward && (
                <div className="mt-5 rounded-2xl border border-purple-200 bg-white p-5">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-[#7447D7]">
                            <Award className="h-6 w-6" />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-[#7447D7]">
                                Insignia desbloqueada
                            </p>

                            <h3 className="mt-1 text-lg font-bold text-slate-950">
                                {skillPath.reward.badgeName}
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                {skillPath.reward.badgeDescription}
                            </p>

                            {skillPath.reward.awardedAt && (
                                <p className="mt-2 text-xs font-medium text-slate-500">
                                    Obtenida el {skillPath.reward.awardedAt}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}