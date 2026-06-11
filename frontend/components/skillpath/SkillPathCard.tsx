import { ArrowRight, Award, Clock, Star } from "lucide-react";
import { SkillPathActionButton } from "@/components/skillpath/SkillPathActionButton";

import { SkillPath } from "@/lib/skillpath/types";
import {
    getSkillPathDifficultyClasses,
    getSkillPathDifficultyLabel,
    getSkillPathStatusClasses,
    getSkillPathStatusLabel,
} from "@/lib/skillpath/display";

interface SkillPathCardProps {
    skillPath: SkillPath;
}

export function SkillPathCard({ skillPath }: SkillPathCardProps) {
    return (
        <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-[#7447D7]">
                        {skillPath.platform}
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-slate-900">
                        {skillPath.title}
                    </h3>
                </div>

                {skillPath.isRecommended && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-[#7447D7]">
            <Star className="h-3.5 w-3.5" />
            Recomendado
          </span>
                )}
            </div>

            <p className="mb-4 text-sm leading-6 text-slate-600">
                {skillPath.description}
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
        <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${getSkillPathDifficultyClasses(
                skillPath.difficulty,
            )}`}
        >
          {getSkillPathDifficultyLabel(skillPath.difficulty)}
        </span>

                <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getSkillPathStatusClasses(
                        skillPath.status,
                    )}`}
                >
          {getSkillPathStatusLabel(skillPath.status)}
        </span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span>{skillPath.durationLabel}</span>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                    <Award className="h-4 w-4 text-slate-500" />
                    <span>{skillPath.xp} XP</span>
                </div>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
                {skillPath.skills.slice(0, 3).map((skill) => (
                    <span
                        key={skill.id}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                    >
            {skill.name}
          </span>
                ))}
            </div>

            <div className="mt-auto">
                <SkillPathActionButton skillPath={skillPath} />
            </div>
        </article>
    );
}