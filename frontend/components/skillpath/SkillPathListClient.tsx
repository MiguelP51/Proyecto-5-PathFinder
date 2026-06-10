"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { SkillPathCard } from "@/components/skillpath/SkillPathCard";
import {
    SkillPath,
    SkillPathDifficulty,
    SkillPathStatus,
} from "@/lib/skillpath/types";
import {
    getSkillPathDifficultyLabel,
    getSkillPathStatusLabel,
} from "@/lib/skillpath/display";

interface SkillPathListClientProps {
    skillPaths: SkillPath[];
    isSubareaView: boolean;
}

const difficultyOptions: Array<SkillPathDifficulty | "TODOS"> = [
    "TODOS",
    "BASICO",
    "INTERMEDIO",
    "AVANZADO",
];

const statusOptions: Array<SkillPathStatus | "TODOS"> = [
    "TODOS",
    "DISPONIBLE",
    "EN_PROGRESO",
    "COMPLETADO",
    "CERTIFICADO_PENDIENTE",
    "VALIDACION_PENDIENTE",
    "VALIDADO",
    "RECHAZADO",
];

export function SkillPathListClient({
                                        skillPaths,
                                        isSubareaView,
                                    }: SkillPathListClientProps) {
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] =
        useState<SkillPathDifficulty | "TODOS">("TODOS");
    const [status, setStatus] = useState<SkillPathStatus | "TODOS">("TODOS");

    const filteredSkillPaths = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return skillPaths.filter((skillPath) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                skillPath.title.toLowerCase().includes(normalizedSearch) ||
                skillPath.platform.toLowerCase().includes(normalizedSearch) ||
                skillPath.description.toLowerCase().includes(normalizedSearch) ||
                skillPath.skills.some((skill) =>
                    skill.name.toLowerCase().includes(normalizedSearch),
                );

            const matchesDifficulty =
                difficulty === "TODOS" || skillPath.difficulty === difficulty;

            const matchesStatus = status === "TODOS" || skillPath.status === status;

            return matchesSearch && matchesDifficulty && matchesStatus;
        });
    }, [skillPaths, search, difficulty, status]);

    const hasActiveFilters =
        search.trim().length > 0 || difficulty !== "TODOS" || status !== "TODOS";

    const clearFilters = () => {
        setSearch("");
        setDifficulty("TODOS");
        setStatus("TODOS");
    };

    return (
        <div>
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-[#7447D7]" />
                    <h3 className="text-base font-bold text-slate-950">
                        Buscar y filtrar SkillPaths
                    </h3>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-end">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Buscar
                        </label>

                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar por curso, plataforma o habilidad"
                                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7447D7] focus:ring-2 focus:ring-purple-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Dificultad
                        </label>

                        <select
                            value={difficulty}
                            onChange={(event) =>
                                setDifficulty(event.target.value as SkillPathDifficulty | "TODOS")
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#7447D7] focus:ring-2 focus:ring-purple-100"
                        >
                            {difficultyOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option === "TODOS"
                                        ? "Todas"
                                        : getSkillPathDifficultyLabel(option)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Estado
                        </label>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value as SkillPathStatus | "TODOS")
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#7447D7] focus:ring-2 focus:ring-purple-100"
                        >
                            {statusOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option === "TODOS"
                                        ? "Todos"
                                        : getSkillPathStatusLabel(option)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={clearFilters}
                        disabled={!hasActiveFilters}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                        Limpiar
                    </button>
                </div>

                <p className="mt-4 text-sm text-slate-500">
                    Mostrando{" "}
                    <span className="font-semibold text-slate-800">
            {filteredSkillPaths.length}
          </span>{" "}
                    de{" "}
                    <span className="font-semibold text-slate-800">
            {skillPaths.length}
          </span>{" "}
                    SkillPaths
                    {isSubareaView ? " recomendados para esta subárea." : "."}
                </p>
            </div>

            {filteredSkillPaths.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredSkillPaths.map((skillPath) => (
                        <SkillPathCard key={skillPath.id} skillPath={skillPath} />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <h3 className="text-lg font-semibold text-slate-900">
                        No se encontraron SkillPaths
                    </h3>

                    <p className="mt-2 text-sm text-slate-600">
                        Intenta cambiar los filtros o limpiar la búsqueda para ver más
                        recursos disponibles.
                    </p>
                </div>
            )}
        </div>
    );
}