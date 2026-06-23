"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    FileText,
    Loader2,
    Save,
    Send,
} from "lucide-react";

import {
    finishStudentPathChallenge,
    saveStudentPathChallengeProgress,
} from "@/lib/pathchallenge/student-service";
import {
    StudentPathChallenge,
    StudentPathChallengeTask,
    StudentPathChallengeTaskResponseRequest,
} from "@/lib/pathchallenge/student-types";

interface PathChallengeMissionClientProps {
    challenge: StudentPathChallenge;
    backHref?: string;
    backLabel?: string;
}

type TaskResponseState = {
    completed?: boolean;
    responseText?: string;
    selectedOption?: string;
    fileName?: string;
    fileUrl?: string;
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

function normalizeTaskType(taskType?: string | null) {
    return taskType?.trim().toUpperCase() || "INFORMATION";
}

function isTaskComplete(
    task: StudentPathChallengeTask,
    response?: TaskResponseState,
) {
    const taskType = normalizeTaskType(task.taskType);

    if (!task.required) {
        return true;
    }

    if (taskType === "INFORMATION") {
        return Boolean(response?.completed);
    }

    if (taskType === "CHOICE") {
        return Boolean(response?.selectedOption?.trim());
    }

    if (taskType === "TEXT_RESPONSE") {
        return Boolean(response?.responseText?.trim());
    }

    if (taskType === "FILE_UPLOAD") {
        return Boolean(response?.fileUrl?.trim() || response?.fileName?.trim());
    }

    return Boolean(response?.completed);
}

export function PathChallengeMissionClient({
                                               challenge,
                                               backHref = `/user/app/challenges/${challenge.idPathChallenge}`,
                                               backLabel = "Volver al briefing",
                                           }: PathChallengeMissionClientProps) {
    const { data: session } = useSession();
    const token = getSessionToken(session);

    const orderedTasks = useMemo(() => {
        return [...challenge.tasks].sort((a, b) => a.order - b.order);
    }, [challenge.tasks]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState<Record<number, TaskResponseState>>(
        () => {
            const initialResponses: Record<number, TaskResponseState> = {};

            orderedTasks.forEach((task) => {
                initialResponses[task.idPathChallengeTask] = {
                    completed: task.completed,
                    responseText: task.responseText ?? "",
                    selectedOption: task.selectedOption ?? "",
                    fileName: task.fileName ?? "",
                    fileUrl: task.fileUrl ?? "",
                };
            });

            return initialResponses;
        },
    );

    const [entregaTexto, setEntregaTexto] = useState(
        challenge.submission?.text ?? "",
    );
    const [saving, setSaving] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [finished, setFinished] = useState(challenge.status === "COMPLETADO");

    const currentTask = orderedTasks[currentIndex];
    const currentResponse = currentTask
        ? responses[currentTask.idPathChallengeTask]
        : undefined;

    const completedCount = orderedTasks.filter((task) =>
        isTaskComplete(task, responses[task.idPathChallengeTask]),
    ).length;

    const progressPercentage =
        orderedTasks.length > 0
            ? Math.round((completedCount / orderedTasks.length) * 100)
            : 0;

    const allRequiredCompleted = orderedTasks.every((task) =>
        isTaskComplete(task, responses[task.idPathChallengeTask]),
    );

    const buildTaskResponses = (): StudentPathChallengeTaskResponseRequest[] => {
        return orderedTasks.map((task) => {
            const response = responses[task.idPathChallengeTask] ?? {};

            return {
                idPathChallengeTask: task.idPathChallengeTask,
                completed: Boolean(response.completed),
                responseText: response.responseText,
                selectedOption: response.selectedOption,
                fileName: response.fileName,
                fileUrl: response.fileUrl,
            };
        });
    };

    const updateCurrentResponse = (value: TaskResponseState) => {
        if (!currentTask) return;

        setResponses((previous) => ({
            ...previous,
            [currentTask.idPathChallengeTask]: {
                ...previous[currentTask.idPathChallengeTask],
                ...value,
            },
        }));
    };

    const handleSave = async () => {
        setError(null);

        if (!token) {
            setError("No se encontró una sesión válida. Vuelve a iniciar sesión.");
            return;
        }

        setSaving(true);

        try {
            await saveStudentPathChallengeProgress(
                challenge.idPathChallenge,
                {
                    taskResponses: buildTaskResponses(),
                    entregaTexto,
                },
                token,
            );
        } catch (err) {
            console.error(err);
            setError("No se pudo guardar el avance. Intenta nuevamente.");
        } finally {
            setSaving(false);
        }
    };

    const handleFinish = async () => {
        setError(null);

        if (!token) {
            setError("No se encontró una sesión válida. Vuelve a iniciar sesión.");
            return;
        }

        if (!allRequiredCompleted) {
            setError("Debes completar todas las tareas obligatorias antes de enviar.");
            return;
        }

        if (!entregaTexto.trim()) {
            setError("Debes escribir una entrega final antes de enviar la misión.");
            return;
        }

        setFinishing(true);

        try {
            await finishStudentPathChallenge(
                challenge.idPathChallenge,
                {
                    taskResponses: buildTaskResponses(),
                    entregaTexto,
                },
                token,
            );

            setFinished(true);
        } catch (err) {
            console.error(err);
            setError("No se pudo enviar la misión. Revisa tu avance e intenta nuevamente.");
        } finally {
            setFinishing(false);
        }
    };

    const goNext = async () => {
        if (currentIndex < orderedTasks.length - 1) {
            setCurrentIndex((value) => value + 1);
        }
    };

    const goPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex((value) => value - 1);
        }
    };

    if (orderedTasks.length === 0) {
        return (
            <main className="min-h-screen bg-slate-50">
                <section className="mx-auto max-w-5xl px-6 py-8">
                    <Link
                        href={backHref}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#7447D7]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {backLabel}
                    </Link>

                    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <h1 className="text-2xl font-bold text-slate-900">
                            Esta misión no tiene tareas configuradas
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Agrega tareas al PathChallenge para que el estudiante pueda realizarlo.
                        </p>
                    </div>
                </section>
            </main>
        );
    }

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

                <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#7447D7]">
                                PathChallenge
                            </p>
                            <h1 className="mt-1 text-2xl font-bold text-slate-900">
                                {challenge.title}
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm text-slate-500">
                                Completa las tareas de la misión y registra tu entrega final.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-purple-50 px-4 py-3 text-sm font-semibold text-[#7447D7]">
                            {completedCount} de {orderedTasks.length} tareas
                        </div>
                    </div>

                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-[#7447D7] transition-all"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {finished && (
                    <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-5 w-5" />
                            <div>
                                <h2 className="font-bold">Misión enviada</h2>
                                <p className="mt-1 text-sm">
                                    Tu PathChallenge fue enviado correctamente.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                    <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="px-2 text-sm font-bold text-slate-900">
                            Tareas de la misión
                        </h2>

                        <div className="mt-4 space-y-2">
                            {orderedTasks.map((task, index) => {
                                const complete = isTaskComplete(
                                    task,
                                    responses[task.idPathChallengeTask],
                                );
                                const active = index === currentIndex;

                                return (
                                    <button
                                        key={task.idPathChallengeTask}
                                        type="button"
                                        onClick={() => setCurrentIndex(index)}
                                        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${
                                            active
                                                ? "bg-[#7447D7] text-white"
                                                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                                        }`}
                                    >
                    <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            complete
                                ? "bg-emerald-100 text-emerald-700"
                                : active
                                    ? "bg-white/20 text-white"
                                    : "bg-white text-slate-500"
                        }`}
                    >
                      {complete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                    </span>

                                        <span className="line-clamp-2 font-medium">
                      {task.title || `Tarea ${task.order}`}
                    </span>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-[#7447D7]">
                                    Tarea {currentIndex + 1} de {orderedTasks.length}
                                </p>
                                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                                    {currentTask.title || `Tarea ${currentTask.order}`}
                                </h2>
                                <p className="mt-2 text-sm text-slate-500">
                                    {currentTask.description}
                                </p>
                            </div>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {normalizeTaskType(currentTask.taskType)}
              </span>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                            <TaskRenderer
                                task={currentTask}
                                response={currentResponse}
                                onChange={updateCurrentResponse}
                            />
                        </div>

                        {currentIndex === orderedTasks.length - 1 && (
                            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                                <div className="flex items-start gap-3">
                                    <FileText className="mt-1 h-5 w-5 text-[#7447D7]" />
                                    <div className="w-full">
                                        <h3 className="font-bold text-slate-900">Entrega final</h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Escribe un resumen o solución final de tu misión.
                                        </p>

                                        <textarea
                                            value={entregaTexto}
                                            onChange={(event) => setEntregaTexto(event.target.value)}
                                            rows={5}
                                            placeholder="Escribe aquí tu entrega final..."
                                            className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#7447D7] focus:ring-2 focus:ring-purple-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="button"
                                onClick={goPrevious}
                                disabled={currentIndex === 0}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </button>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving || finishing}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Guardar avance
                                </button>

                                {currentIndex < orderedTasks.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={goNext}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7447D7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6338c5]"
                                    >
                                        Continuar
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleFinish}
                                        disabled={saving || finishing}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7447D7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6338c5] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {finishing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                        Enviar misión
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
}

interface TaskRendererProps {
    task: StudentPathChallengeTask;
    response?: TaskResponseState;
    onChange: (value: TaskResponseState) => void;
}

function TaskRenderer({ task, response, onChange }: TaskRendererProps) {
    const taskType = normalizeTaskType(task.taskType);

    if (taskType === "CHOICE") {
        return (
            <div>
                <p className="text-sm text-slate-600">
                    {task.content || "Selecciona una opción para continuar."}
                </p>

                <div className="mt-4 space-y-3">
                    {(task.options ?? []).map((option) => (
                        <label
                            key={option}
                            className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                                response?.selectedOption === option
                                    ? "border-[#7447D7] bg-purple-50 text-[#7447D7]"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            <input
                                type="radio"
                                name={`task-${task.idPathChallengeTask}`}
                                value={option}
                                checked={response?.selectedOption === option}
                                onChange={() =>
                                    onChange({
                                        selectedOption: option,
                                        completed: true,
                                    })
                                }
                                className="h-4 w-4"
                            />
                            {option}
                        </label>
                    ))}
                </div>
            </div>
        );
    }

    if (taskType === "TEXT_RESPONSE") {
        return (
            <div>
                <p className="text-sm text-slate-600">
                    {task.content || "Redacta tu respuesta para completar esta tarea."}
                </p>

                <textarea
                    value={response?.responseText ?? ""}
                    onChange={(event) =>
                        onChange({
                            responseText: event.target.value,
                            completed: Boolean(event.target.value.trim()),
                        })
                    }
                    rows={8}
                    placeholder="Escribe tu respuesta..."
                    className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#7447D7] focus:ring-2 focus:ring-purple-100"
                />
            </div>
        );
    }

    if (taskType === "FILE_UPLOAD") {
        return (
            <div>
                <p className="text-sm text-slate-600">
                    {task.content || "Adjunta el archivo solicitado para completar esta tarea."}
                </p>

                <input
                    type="file"
                    onChange={(event) => {
                        const file = event.target.files?.[0];

                        onChange({
                            fileName: file?.name ?? "",
                            completed: Boolean(file),
                        });
                    }}
                    className="mt-4 block w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-600"
                />

                {response?.fileName && (
                    <p className="mt-3 text-sm font-medium text-emerald-700">
                        Archivo seleccionado: {response.fileName}
                    </p>
                )}

                <p className="mt-3 text-xs text-slate-400">
                    Por ahora se guarda el nombre del archivo. La subida real a S3 puede conectarse después.
                </p>
            </div>
        );
    }

    return (
        <div>
            <p className="text-sm leading-6 text-slate-600">
                {task.content || task.description}
            </p>

            <button
                type="button"
                onClick={() =>
                    onChange({
                        completed: true,
                    })
                }
                className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    response?.completed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-[#7447D7] text-white hover:bg-[#6338c5]"
                }`}
            >
                <CheckCircle2 className="h-4 w-4" />
                {response?.completed ? "Revisado" : "Marcar como revisado"}
            </button>
        </div>
    );
}