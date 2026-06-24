"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    ClipboardList,
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
    responseJson?: string;
};

type BacklogItem = {
    code: string;
    name: string;
    effort: number;
    value?: string;
    urgency?: string;
    dependencies?: string[];
};

type TaskConfig = {
    role?: string;
    context?: string;
    goal?: string;
    constraints?: string[];
    options?: string[];
    minSelections?: number;
    resourceType?: string;
    capacity?: number;
    columns?: string[];
    items?: BacklogItem[];
    validation?: {
        maxEffort?: number;
        minItems?: number;
    };
    placeholder?: string;
    minLength?: number;
    sections?: string[];
};

type JsonResponse = {
    reviewed?: boolean;
    selectedOptions?: string[];
    selectedItems?: string[];
    totalEffort?: number;
    text?: string;
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
    return taskType?.trim().toUpperCase() || "SCENARIO";
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
    if (!value || !value.trim()) {
        return fallback;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}

function getConfig(task: StudentPathChallengeTask): TaskConfig {
    return parseJson<TaskConfig>(task.configJson, {});
}

function getJsonResponse(response?: TaskResponseState): JsonResponse {
    return parseJson<JsonResponse>(response?.responseJson, {});
}

function getSelectedPlanItems(
    task: StudentPathChallengeTask,
    response?: TaskResponseState,
) {
    const config = getConfig(task);
    const jsonResponse = getJsonResponse(response);
    const selectedCodes = jsonResponse.selectedItems ?? [];

    return (config.items ?? []).filter((item) => selectedCodes.includes(item.code));
}

function getSelectedPlanEffort(
    task: StudentPathChallengeTask,
    response?: TaskResponseState,
) {
    return getSelectedPlanItems(task, response).reduce(
        (total, item) => total + item.effort,
        0,
    );
}

function isTaskComplete(
    task: StudentPathChallengeTask,
    response?: TaskResponseState,
) {
    const taskType = normalizeTaskType(task.taskType);
    const config = getConfig(task);
    const jsonResponse = getJsonResponse(response);

    if (!task.required) {
        return true;
    }

    if (taskType === "SCENARIO" || taskType === "RESOURCE_REVIEW") {
        return Boolean(response?.completed || jsonResponse.reviewed);
    }

    if (taskType === "MULTI_SELECT") {
        const minSelections = config.minSelections ?? 1;
        return (jsonResponse.selectedOptions ?? []).length >= minSelections;
    }

    if (taskType === "PLAN_BUILDER") {
        const selectedItems = jsonResponse.selectedItems ?? [];
        const minItems = config.validation?.minItems ?? 1;
        const maxEffort = config.validation?.maxEffort ?? config.capacity ?? 20;
        const totalEffort = getSelectedPlanEffort(task, response);

        return selectedItems.length >= minItems && totalEffort <= maxEffort;
    }

    if (taskType === "TEXT_RESPONSE") {
        const minLength = config.minLength ?? 1;
        const text = response?.responseText?.trim() ?? jsonResponse.text?.trim() ?? "";

        return text.length >= minLength;
    }

    if (taskType === "FINAL_REVIEW") {
        return true;
    }

    if (taskType === "CHOICE" || taskType === "SINGLE_CHOICE") {
        return Boolean(response?.selectedOption?.trim());
    }

    if (taskType === "FILE_UPLOAD") {
        return Boolean(response?.fileUrl?.trim() || response?.fileName?.trim());
    }

    return Boolean(response?.completed);
}

function formatDependencies(dependencies?: string[]) {
    if (!dependencies || dependencies.length === 0) {
        return "Ninguna";
    }

    return dependencies.join(", ");
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

    const actionTasks = useMemo(() => {
        return orderedTasks.filter(
            (task) => normalizeTaskType(task.taskType) !== "FINAL_REVIEW",
        );
    }, [orderedTasks]);

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
                    responseJson: task.responseJson ?? "",
                };
            });

            return initialResponses;
        },
    );

    const [saving, setSaving] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [finished, setFinished] = useState(challenge.status === "COMPLETADO");

    const currentTask = orderedTasks[currentIndex];
    const currentResponse = currentTask
        ? responses[currentTask.idPathChallengeTask]
        : undefined;

    const completedCount = actionTasks.filter((task) =>
        isTaskComplete(task, responses[task.idPathChallengeTask]),
    ).length;

    const progressPercentage =
        actionTasks.length > 0
            ? Math.round((completedCount / actionTasks.length) * 100)
            : 0;

    const allRequiredCompleted = actionTasks.every((task) =>
        isTaskComplete(task, responses[task.idPathChallengeTask]),
    );

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

    const buildFinalSummaryText = () => {
        const lines: string[] = [];

        lines.push(`PathChallenge: ${challenge.title}`);

        orderedTasks.forEach((task) => {
            const taskType = normalizeTaskType(task.taskType);

            if (taskType === "FINAL_REVIEW") {
                return;
            }

            const response = responses[task.idPathChallengeTask];
            const jsonResponse = getJsonResponse(response);

            lines.push(`\n${task.order}. ${task.title}`);

            if (taskType === "MULTI_SELECT") {
                lines.push(
                    `Problemas seleccionados: ${(jsonResponse.selectedOptions ?? []).join(", ")}`,
                );
            } else if (taskType === "PLAN_BUILDER") {
                const selectedItems = getSelectedPlanItems(task, response);
                const totalEffort = getSelectedPlanEffort(task, response);

                lines.push(
                    `Tareas seleccionadas: ${selectedItems
                        .map((item) => `${item.code} - ${item.name}`)
                        .join(", ")}`,
                );
                lines.push(`Total de puntos: ${totalEffort}`);
            } else if (taskType === "TEXT_RESPONSE") {
                lines.push(`Justificación: ${response?.responseText ?? ""}`);
            } else if (taskType === "SCENARIO" || taskType === "RESOURCE_REVIEW") {
                lines.push("Actividad revisada.");
            }
        });

        return lines.join("\n");
    };

    const buildTaskResponses = (): StudentPathChallengeTaskResponseRequest[] => {
        return orderedTasks.map((task) => {
            const response = responses[task.idPathChallengeTask] ?? {};
            const taskType = normalizeTaskType(task.taskType);
            const completed =
                taskType === "FINAL_REVIEW"
                    ? allRequiredCompleted
                    : isTaskComplete(task, response);

            return {
                idPathChallengeTask: task.idPathChallengeTask,
                completed,
                responseText: response.responseText,
                selectedOption: response.selectedOption,
                fileName: response.fileName,
                fileUrl: response.fileUrl,
                responseJson: response.responseJson,
            };
        });
    };

    const handleSave = async () => {
        setError(null);
        setSuccessMessage(null);

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
                    entregaTexto: buildFinalSummaryText(),
                },
                token,
            );

            setSuccessMessage("Avance guardado correctamente.");
        } catch (err) {
            console.error(err);
            setError("No se pudo guardar el avance. Intenta nuevamente.");
        } finally {
            setSaving(false);
        }
    };

    const handleFinish = async () => {
        setError(null);
        setSuccessMessage(null);

        if (!token) {
            setError("No se encontró una sesión válida. Vuelve a iniciar sesión.");
            return;
        }

        if (!allRequiredCompleted) {
            setError("Debes completar todas las actividades obligatorias antes de enviar.");
            return;
        }

        setFinishing(true);

        try {
            await finishStudentPathChallenge(
                challenge.idPathChallenge,
                {
                    taskResponses: buildTaskResponses(),
                    entregaTexto: buildFinalSummaryText(),
                },
                token,
            );

            setFinished(true);
            setSuccessMessage("Misión enviada correctamente.");
        } catch (err) {
            console.error(err);
            setError("No se pudo enviar la misión. Revisa tu avance e intenta nuevamente.");
        } finally {
            setFinishing(false);
        }
    };

    const goNext = () => {
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
                            Esta misión no tiene actividades configuradas
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Agrega actividades al PathChallenge para que el estudiante pueda realizarlo.
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
                                Completa las actividades guiadas, toma decisiones y revisa tu propuesta antes de enviarla.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-purple-50 px-4 py-3 text-sm font-semibold text-[#7447D7]">
                            {completedCount} de {actionTasks.length} actividades
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
                                    Tu PathChallenge fue enviado correctamente. Para este MVP,
                                    esto significa que quedó completado por el estudiante.
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

                {successMessage && (
                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {successMessage}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
                    <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="px-2 text-sm font-bold text-slate-900">
                            Actividades de la misión
                        </h2>

                        <div className="mt-4 space-y-2">
                            {orderedTasks.map((task, index) => {
                                const taskType = normalizeTaskType(task.taskType);
                                const complete =
                                    taskType === "FINAL_REVIEW"
                                        ? allRequiredCompleted
                                        : isTaskComplete(task, responses[task.idPathChallengeTask]);
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
                      {task.title || `Actividad ${task.order}`}
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
                                    Actividad {currentIndex + 1} de {orderedTasks.length}
                                </p>
                                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                                    {currentTask.title || `Actividad ${currentTask.order}`}
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
                                allTasks={orderedTasks}
                                allResponses={responses}
                            />
                        </div>

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
                                        disabled={saving || finishing || !allRequiredCompleted}
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
    allTasks: StudentPathChallengeTask[];
    allResponses: Record<number, TaskResponseState>;
}

function TaskRenderer({
                          task,
                          response,
                          onChange,
                          allTasks,
                          allResponses,
                      }: TaskRendererProps) {
    const taskType = normalizeTaskType(task.taskType);
    const config = getConfig(task);
    const jsonResponse = getJsonResponse(response);

    if (taskType === "SCENARIO") {
        return (
            <div className="space-y-5">
                <div className="rounded-2xl bg-white p-5">
                    <p className="text-sm leading-6 text-slate-700 whitespace-pre-line">
                        {task.content || task.description}
                    </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    {config.role && (
                        <InfoBox title="Rol asignado" value={config.role} />
                    )}
                    {config.goal && (
                        <InfoBox title="Objetivo" value={config.goal} />
                    )}
                    {config.context && (
                        <InfoBox title="Contexto" value={config.context} />
                    )}
                    {config.constraints && config.constraints.length > 0 && (
                        <div className="rounded-2xl bg-white p-4">
                            <h4 className="text-sm font-bold text-slate-900">
                                Restricciones
                            </h4>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                                {config.constraints.map((constraint) => (
                                    <li key={constraint}>{constraint}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() =>
                        onChange({
                            completed: true,
                            responseJson: JSON.stringify({ reviewed: true }),
                        })
                    }
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        response?.completed || jsonResponse.reviewed
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-[#7447D7] text-white hover:bg-[#6338c5]"
                    }`}
                >
                    <CheckCircle2 className="h-4 w-4" />
                    {response?.completed || jsonResponse.reviewed
                        ? "Escenario revisado"
                        : "Marcar escenario como revisado"}
                </button>
            </div>
        );
    }

    if (taskType === "MULTI_SELECT") {
        const selectedOptions = jsonResponse.selectedOptions ?? [];
        const minSelections = config.minSelections ?? 1;

        const toggleOption = (option: string) => {
            const nextSelected = selectedOptions.includes(option)
                ? selectedOptions.filter((item) => item !== option)
                : [...selectedOptions, option];

            onChange({
                completed: nextSelected.length >= minSelections,
                responseJson: JSON.stringify({
                    selectedOptions: nextSelected,
                }),
            });
        };

        return (
            <div>
                <p className="text-sm text-slate-600">
                    {task.content || "Selecciona las opciones que correspondan."}
                </p>

                <div className="mt-4 space-y-3">
                    {(config.options ?? []).map((option) => {
                        const selected = selectedOptions.includes(option);

                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => toggleOption(option)}
                                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                                    selected
                                        ? "border-[#7447D7] bg-purple-50 text-[#7447D7]"
                                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        selected
                            ? "border-[#7447D7] bg-[#7447D7] text-white"
                            : "border-slate-300 bg-white"
                    }`}
                >
                  {selected && <CheckCircle2 className="h-3.5 w-3.5" />}
                </span>
                                {option}
                            </button>
                        );
                    })}
                </div>

                <p className="mt-3 text-xs text-slate-400">
                    Seleccionadas: {selectedOptions.length}. Mínimo requerido: {minSelections}.
                </p>
            </div>
        );
    }

    if (taskType === "RESOURCE_REVIEW") {
        return (
            <div>
                <p className="text-sm text-slate-600">
                    {task.content || "Revisa la información disponible antes de continuar."}
                </p>

                {config.capacity && (
                    <div className="mt-4 rounded-2xl bg-purple-50 px-4 py-3 text-sm font-semibold text-[#7447D7]">
                        Capacidad máxima del sprint: {config.capacity} puntos
                    </div>
                )}

                <BacklogTable items={config.items ?? []} />

                <button
                    type="button"
                    onClick={() =>
                        onChange({
                            completed: true,
                            responseJson: JSON.stringify({ reviewed: true }),
                        })
                    }
                    className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        response?.completed || jsonResponse.reviewed
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-[#7447D7] text-white hover:bg-[#6338c5]"
                    }`}
                >
                    <CheckCircle2 className="h-4 w-4" />
                    {response?.completed || jsonResponse.reviewed
                        ? "Backlog revisado"
                        : "He revisado el backlog"}
                </button>
            </div>
        );
    }

    if (taskType === "PLAN_BUILDER") {
        const selectedItems = jsonResponse.selectedItems ?? [];
        const totalEffort = getSelectedPlanEffort(task, response);
        const maxEffort = config.validation?.maxEffort ?? config.capacity ?? 20;
        const minItems = config.validation?.minItems ?? 1;
        const exceedsCapacity = totalEffort > maxEffort;

        const toggleItem = (item: BacklogItem) => {
            const nextSelected = selectedItems.includes(item.code)
                ? selectedItems.filter((code) => code !== item.code)
                : [...selectedItems, item.code];

            const nextTotalEffort = (config.items ?? [])
                .filter((backlogItem) => nextSelected.includes(backlogItem.code))
                .reduce((total, backlogItem) => total + backlogItem.effort, 0);

            onChange({
                completed:
                    nextSelected.length >= minItems && nextTotalEffort <= maxEffort,
                responseJson: JSON.stringify({
                    selectedItems: nextSelected,
                    totalEffort: nextTotalEffort,
                }),
            });
        };

        return (
            <div>
                <p className="text-sm text-slate-600">
                    {task.content || "Selecciona las tareas que incluirías en el sprint."}
                </p>

                <div
                    className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold ${
                        exceedsCapacity
                            ? "bg-red-50 text-red-700"
                            : "bg-purple-50 text-[#7447D7]"
                    }`}
                >
                    Total seleccionado: {totalEffort} / {maxEffort} puntos
                </div>

                <div className="mt-4 grid gap-3">
                    {(config.items ?? []).map((item) => {
                        const selected = selectedItems.includes(item.code);

                        return (
                            <button
                                key={item.code}
                                type="button"
                                onClick={() => toggleItem(item)}
                                className={`rounded-2xl border p-4 text-left transition ${
                                    selected
                                        ? "border-[#7447D7] bg-purple-50"
                                        : "border-slate-200 bg-white hover:bg-slate-50"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">
                                            {item.code} - {item.name}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Valor: {item.value ?? "-"} · Urgencia: {item.urgency ?? "-"} ·
                                            Dependencias: {formatDependencies(item.dependencies)}
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                    {item.effort} pts
                  </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {exceedsCapacity && (
                    <p className="mt-3 text-sm text-red-600">
                        La selección supera la capacidad máxima del sprint. Ajusta las tareas antes de enviar.
                    </p>
                )}
            </div>
        );
    }

    if (taskType === "TEXT_RESPONSE") {
        const minLength = config.minLength ?? 1;
        const text = response?.responseText ?? "";
        const completed = text.trim().length >= minLength;

        return (
            <div>
                <p className="text-sm text-slate-600">
                    {task.content || "Redacta tu respuesta para completar esta actividad."}
                </p>

                <textarea
                    value={text}
                    onChange={(event) =>
                        onChange({
                            responseText: event.target.value,
                            completed: event.target.value.trim().length >= minLength,
                            responseJson: JSON.stringify({
                                text: event.target.value,
                            }),
                        })
                    }
                    rows={8}
                    placeholder={config.placeholder ?? "Escribe tu respuesta..."}
                    className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#7447D7] focus:ring-2 focus:ring-purple-100"
                />

                <p
                    className={`mt-2 text-xs ${
                        completed ? "text-emerald-600" : "text-slate-400"
                    }`}
                >
                    Mínimo sugerido: {minLength} caracteres. Actual: {text.trim().length}.
                </p>
            </div>
        );
    }

    if (taskType === "FINAL_REVIEW") {
        return (
            <div>
                <div className="mb-5 flex items-start gap-3 rounded-2xl bg-purple-50 p-4 text-[#7447D7]">
                    <ClipboardList className="mt-0.5 h-5 w-5" />
                    <div>
                        <h3 className="font-bold">Revisión final</h3>
                        <p className="mt-1 text-sm">
                            Revisa tus decisiones antes de enviar la misión.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {allTasks
                        .filter((item) => normalizeTaskType(item.taskType) !== "FINAL_REVIEW")
                        .map((item) => (
                            <TaskSummary
                                key={item.idPathChallengeTask}
                                task={item}
                                response={allResponses[item.idPathChallengeTask]}
                            />
                        ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <p className="text-sm leading-6 text-slate-600 whitespace-pre-line">
                {task.content || task.description}
            </p>

            <button
                type="button"
                onClick={() =>
                    onChange({
                        completed: true,
                        responseJson: JSON.stringify({ reviewed: true }),
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

function InfoBox({ title, value }: { title: string; value: string }) {
    return (
        <div className="rounded-2xl bg-white p-4">
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            <p className="mt-2 text-sm text-slate-600">{value}</p>
        </div>
    );
}

function BacklogTable({ items }: { items: BacklogItem[] }) {
    return (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                        <th className="px-4 py-3">Código</th>
                        <th className="px-4 py-3">Tarea</th>
                        <th className="px-4 py-3">Esfuerzo</th>
                        <th className="px-4 py-3">Valor</th>
                        <th className="px-4 py-3">Urgencia</th>
                        <th className="px-4 py-3">Dependencias</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                        <tr key={item.code}>
                            <td className="px-4 py-3 font-semibold text-slate-900">
                                {item.code}
                            </td>
                            <td className="px-4 py-3 text-slate-700">{item.name}</td>
                            <td className="px-4 py-3 text-slate-700">{item.effort} pts</td>
                            <td className="px-4 py-3 text-slate-700">{item.value}</td>
                            <td className="px-4 py-3 text-slate-700">{item.urgency}</td>
                            <td className="px-4 py-3 text-slate-700">
                                {formatDependencies(item.dependencies)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TaskSummary({
                         task,
                         response,
                     }: {
    task: StudentPathChallengeTask;
    response?: TaskResponseState;
}) {
    const taskType = normalizeTaskType(task.taskType);
    const jsonResponse = getJsonResponse(response);

    let content: ReactNode = "Actividad revisada.";

    if (taskType === "MULTI_SELECT") {
        const selectedOptions = jsonResponse.selectedOptions ?? [];

        content =
            selectedOptions.length > 0
                ? selectedOptions.join(", ")
                : "Sin opciones seleccionadas.";
    }

    if (taskType === "PLAN_BUILDER") {
        const selectedItems = getSelectedPlanItems(task, response);
        const totalEffort = getSelectedPlanEffort(task, response);

        content = (
            <div>
                <p>
                    {selectedItems.length > 0
                        ? selectedItems
                            .map((item) => `${item.code} - ${item.name}`)
                            .join(", ")
                        : "Sin tareas seleccionadas."}
                </p>
                <p className="mt-1 font-semibold text-[#7447D7]">
                    Total: {totalEffort} puntos
                </p>
            </div>
        );
    }

    if (taskType === "TEXT_RESPONSE") {
        content = response?.responseText?.trim() || "Sin justificación registrada.";
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-bold text-slate-900">
                {task.order}. {task.title}
            </p>
            <div className="mt-2 text-sm leading-6 text-slate-600">{content}</div>
        </div>
    );
}