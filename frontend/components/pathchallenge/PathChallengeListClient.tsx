"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { PathChallengeCard } from "@/components/pathchallenge/PathChallengeCard";
import { StudentPathChallenge } from "@/lib/pathchallenge/student-types";

interface PathChallengeListClientProps {
    challenges: StudentPathChallenge[];
}

const statusOptions = [
    "TODOS",
    "DISPONIBLE",
    "EN_PROGRESO",
    "COMPLETADO",
] as const;

const difficultyOptions = [
    "TODOS",
    "Fácil",
    "Facil",
    "Media",
    "Medio",
    "Difícil",
    "Dificil",
    "BASICO",
    "INTERMEDIO",
    "AVANZADO",
] as const;

const statusLabel: Record<string, string> = {
    TODOS: "Todos",
    DISPONIBLE: "Disponible",
    EN_PROGRESO: "En progreso",
    COMPLETADO: "Completado",
};

export function PathChallengeListClient({
                                            challenges,
                                        }: PathChallengeListClientProps) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<(typeof statusOptions)[number]>("TODOS");
    const [difficulty, setDifficulty] =
        useState<(typeof difficultyOptions)[number]>("TODOS");

    const filteredChallenges = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return challenges.filter((challenge) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                challenge.title.toLowerCase().includes(normalizedSearch) ||
                challenge.description.toLowerCase().includes(normalizedSearch) ||
                challenge.skills.some((skill) =>
                    skill.name.toLowerCase().includes(normalizedSearch),
                );

            const matchesStatus =
                status === "TODOS" || challenge.status === status;

            const matchesDifficulty =
                difficulty === "TODOS" ||
                challenge.difficulty.toLowerCase() === difficulty.toLowerCase();

            return matchesSearch && matchesStatus && matchesDifficulty;
        });
    }, [challenges, search, status, difficulty]);

    const hasActiveFilters =
        search.trim().length > 0 || status !== "TODOS" || difficulty !== "TODOS";

    const clearFilters = () => {
        setSearch("");
        setStatus("TODOS");
        setDifficulty("TODOS");
    };

    return (
        <div>
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-[#7447D7]" />
                    <h3 className="text-base font-bold text-slate-950">
                        Buscar y filtrar Challenges
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
                                placeholder="Buscar por misión o habilidad"
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
                                setDifficulty(event.target.value as typeof difficulty)
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#7447D7] focus:ring-2 focus:ring-purple-100"
                        >
                            {difficultyOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option === "TODOS" ? "Todas" : option}
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
                            onChange={(event) => setStatus(event.target.value as typeof status)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#7447D7] focus:ring-2 focus:ring-purple-100"
                        >
                            {statusOptions.map((option) => (
                                <option key={option} value={option}>
                                    {statusLabel[option] ?? option}
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
            {filteredChallenges.length}
          </span>{" "}
                    de{" "}
                    <span className="font-semibold text-slate-800">
            {challenges.length}
          </span>{" "}
                    Challenges.
                </p>
            </div>

            {filteredChallenges.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredChallenges.map((challenge) => (
                        <PathChallengeCard
                            key={challenge.idPathChallenge}
                            challenge={challenge}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <h3 className="text-lg font-semibold text-slate-900">
                        No se encontraron Challenges
                    </h3>

                    <p className="mt-2 text-sm text-slate-600">
                        Cuando inicies una misión práctica desde una subárea, aparecerá aquí
                        para que puedas continuarla.
                    </p>
                </div>
            )}
        </div>
    );
}