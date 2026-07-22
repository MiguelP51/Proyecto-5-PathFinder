"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Trash2 } from "lucide-react";

import { PathChallengeRequestDTO, PathChallengeTaskDTO } from "@/lib/pathchallenge/types";
import { pathChallengeService } from "@/lib/pathchallenge/service";
import { apiFetch } from "@/lib/api";

type TaskType =
  | "TEXT_RESPONSE"
  | "INFORMATION"
  | "PLAN_BUILDER"
  | "DOCUMENT_REVIEW"
  | "RESOURCE_REVIEW"
  | "MULTI_SELECT"
  | "FINAL_REVIEW"
  | "SCENARIO"
  | "FILE_UPLOAD";

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
  items?: BacklogItem[];
  validation?: {
    maxEffort?: number;
    minItems?: number;
  };
  placeholder?: string;
  minLength?: number;
  uploadTitle?: string;
  uploadInstruction?: string;
  acceptedExtensions?: string[];
  acceptedLabel?: string;
  maxSizeMb?: number;
  uploadService?: string;
  audioText?: string;
  documentTitle?: string;
  documentName?: string;
  documentType?: string;
  documentKey?: string | null;
  previewImageUrl?: string | null;
  downloadUrl?: string | null;
  downloadLabel?: string;
  companyInfo?: {
    name?: string;
    description?: string;
    area?: string;
  };
  objectives?: string[];
  reviewTitle?: string;
  reviewText?: string;
  successModal?: {
    title?: string;
    message?: string;
    badgeName?: string;
    points?: number;
  };
  reviewMode?: "SUMMARY_ONLY" | "SUBMISSION_REVIEW" | "FILE_COMPARISON";
  comparison?: {
    sourceTaskType?: string;
    submissionTaskType?: string;
    sourceTaskOrder?: number;
    submissionTaskOrder?: number;
  };
};

type AdminTaskForm = PathChallengeTaskDTO & {
  titulo: string;
  tipoTarea: TaskType;
  contenido: string;
  obligatoria: boolean;
  config: TaskConfig;
};

type AdminPathChallengeForm = Omit<PathChallengeRequestDTO, "tareas"> & {
  tareas: AdminTaskForm[];
};

type AdminSubarea = {
  idSubarea: number;
  nombre: string;
  areaNombre?: string | null;
  activo?: boolean;
};

const TASK_TYPES: { value: TaskType; label: string; description: string }[] = [
  {
    value: "INFORMATION",
    label: "Información",
    description: "Texto de lectura o indicaciones simples.",
  },
  {
    value: "SCENARIO",
    label: "Escenario",
    description: "Caso con rol, contexto, objetivo y restricciones.",
  },
  {
    value: "DOCUMENT_REVIEW",
    label: "Revisión de documento",
    description: "Plantilla o archivo base que el estudiante revisa.",
  },
  {
    value: "RESOURCE_REVIEW",
    label: "Revisión de recurso",
    description: "Backlog o recurso estructurado para revisar.",
  },
  {
    value: "MULTI_SELECT",
    label: "Selección múltiple",
    description: "Opciones con mínimo de selección requerido.",
  },
  {
    value: "PLAN_BUILDER",
    label: "Constructor de plan",
    description: "Selección de tareas con esfuerzo máximo.",
  },
  {
    value: "TEXT_RESPONSE",
    label: "Respuesta escrita",
    description: "Campo de texto con mínimo de caracteres.",
  },
  {
    value: "FILE_UPLOAD",
    label: "Carga de archivo",
    description: "Entrega mediante archivo con formatos permitidos.",
  },
  {
    value: "FINAL_REVIEW",
    label: "Revisión final",
    description: "Resumen final o comparación de archivos.",
  },
];

const sharedInputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0E3E66] focus:ring-2 focus:ring-blue-100";

const compactInputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0E3E66] focus:ring-2 focus:ring-blue-100";

function defaultConfigForType(tipoTarea: TaskType): TaskConfig {
  if (tipoTarea === "SCENARIO") {
    return {
      role: "",
      context: "",
      goal: "",
      constraints: [""],
    };
  }

  if (tipoTarea === "MULTI_SELECT") {
    return {
      options: ["", ""],
      minSelections: 1,
    };
  }

  if (tipoTarea === "RESOURCE_REVIEW") {
    return {
      resourceType: "backlog",
      capacity: 20,
      items: [emptyBacklogItem()],
    };
  }

  if (tipoTarea === "PLAN_BUILDER") {
    return {
      capacity: 20,
      items: [emptyBacklogItem()],
      validation: {
        maxEffort: 20,
        minItems: 1,
      },
    };
  }

  if (tipoTarea === "TEXT_RESPONSE") {
    return {
      placeholder: "Escribe tu respuesta...",
      minLength: 1,
    };
  }

  if (tipoTarea === "FILE_UPLOAD") {
    return {
      uploadTitle: "Archivos adjuntos",
      uploadInstruction: "Selecciona el archivo solicitado.",
      acceptedExtensions: [".pdf", ".docx", ".xlsx", ".jpg", ".jpeg", ".png"],
      acceptedLabel: "PDF, DOCX, XLSX, JPG o PNG",
      maxSizeMb: 10,
      uploadService: "student-task-file",
      audioText: "",
    };
  }

  if (tipoTarea === "DOCUMENT_REVIEW") {
    return {
      documentTitle: "Documento base",
      documentName: "",
      documentType: "Documento",
      documentKey: "",
      previewImageUrl: "",
      downloadUrl: "",
      downloadLabel: "Descargar archivo adjunto",
      companyInfo: {
        name: "",
        description: "",
        area: "",
      },
      objectives: [""],
    };
  }

  if (tipoTarea === "FINAL_REVIEW") {
    return {
      reviewMode: "SUMMARY_ONLY",
      reviewTitle: "Revisión final",
      reviewText: "Revisa el resumen de tus respuestas antes de enviar la misión.",
      comparison: {
        sourceTaskType: "DOCUMENT_REVIEW",
        submissionTaskType: "FILE_UPLOAD",
      },
      successModal: {
        title: "Misión completada",
        message: "Tu entrega fue registrada correctamente.",
        badgeName: "",
        points: 0,
      },
    };
  }

  return {};
}

function emptyBacklogItem(): BacklogItem {
  return {
    code: "",
    name: "",
    effort: 1,
    value: "",
    urgency: "",
    dependencies: [],
  };
}

function createTask(orden: number): AdminTaskForm {
  return {
    descripcion: "",
    orden,
    titulo: "",
    tipoTarea: "INFORMATION",
    contenido: "",
    obligatoria: true,
    opcionesJson: "[]",
    configJson: "{}",
    config: defaultConfigForType("INFORMATION"),
  };
}

function cleanStringArray(values?: string[]) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function cleanConfig(config: TaskConfig): TaskConfig {
  const cleaned: TaskConfig = {};

  Object.entries(config).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      if (key === "items") {
        const backlogItems = (value as BacklogItem[])
          .map((item) => ({
            ...item,
            code: item.code?.trim(),
            name: item.name?.trim(),
            dependencies: cleanStringArray(item.dependencies),
          }))
          .filter((item) => item.code || item.name);

        if (backlogItems.length > 0) {
          cleaned.items = backlogItems;
        }
        return;
      }

      const stringValues = cleanStringArray(value as string[]);
      if (stringValues.length > 0) {
        (cleaned as Record<string, unknown>)[key] = stringValues;
      }
      return;
    }

    if (typeof value === "object") {
      const nested = cleanConfig(value as TaskConfig);
      if (Object.keys(nested).length > 0) {
        (cleaned as Record<string, unknown>)[key] = nested;
      }
      return;
    }

    (cleaned as Record<string, unknown>)[key] =
      typeof value === "string" ? value.trim() : value;
  });

  return cleaned;
}

function buildTaskPayload(task: AdminTaskForm): PathChallengeTaskDTO {
  const options =
    task.tipoTarea === "MULTI_SELECT"
      ? cleanStringArray(task.config.options)
      : [];

  return {
    descripcion: task.descripcion.trim(),
    orden: task.orden,
    titulo: task.titulo.trim() || `Tarea ${task.orden}`,
    tipoTarea: task.tipoTarea,
    contenido: task.contenido.trim(),
    opcionesJson: JSON.stringify(options),
    obligatoria: task.obligatoria,
    configJson: JSON.stringify(cleanConfig(task.config)),
  };
}

export default function NewPathChallengePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [loadingSubareas, setLoadingSubareas] = useState(false);
  const [subareas, setSubareas] = useState<AdminSubarea[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AdminPathChallengeForm>({
    titulo: "",
    dificultad: "Facil",
    xp: 0,
    estado: "Borrador",
    subareaId: 0,
    habilidadesIds: [],
    tareas: [],
  });

  useEffect(() => {
    const loadSubareas = async () => {
      try {
        setLoadingSubareas(true);
        const data = await apiFetch<AdminSubarea[]>(
          "/api/admin/subareas?soloActivos=true",
          {},
          session?.backendJwt,
        );

        setSubareas(data || []);
        setFormData((prev) => ({
          ...prev,
          subareaId: prev.subareaId || data?.[0]?.idSubarea || 0,
        }));
      } catch (error) {
        console.error("Error loading subareas for PathChallenge:", error);
        setFormError(
          error instanceof Error
            ? `No se pudieron cargar las subáreas: ${error.message}`
            : "No se pudieron cargar las subáreas.",
        );
      } finally {
        setLoadingSubareas(false);
      }
    };

    if (status === "authenticated" && session?.backendJwt) {
      loadSubareas();
    }
  }, [status, session?.backendJwt]);

  const taskCountLabel = useMemo(() => {
    if (formData.tareas.length === 1) {
      return "1 tarea configurada";
    }

    return `${formData.tareas.length} tareas configuradas`;
  }, [formData.tareas.length]);

  const updateTask = (index: number, updates: Partial<AdminTaskForm>) => {
    setFormData((prev) => ({
      ...prev,
      tareas: prev.tareas.map((task, taskIndex) =>
        taskIndex === index ? { ...task, ...updates } : task,
      ),
    }));
  };

  const updateTaskConfig = (index: number, updates: Partial<TaskConfig>) => {
    setFormData((prev) => ({
      ...prev,
      tareas: prev.tareas.map((task, taskIndex) =>
        taskIndex === index
          ? { ...task, config: { ...task.config, ...updates } }
          : task,
      ),
    }));
  };

  const handleAddTask = () => {
    setFormData((prev) => ({
      ...prev,
      tareas: [...prev.tareas, createTask(prev.tareas.length + 1)],
    }));
  };

  const handleRemoveTask = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tareas: prev.tareas
        .filter((_, taskIndex) => taskIndex !== index)
        .map((task, taskIndex) => ({ ...task, orden: taskIndex + 1 })),
    }));
  };

  const handleTaskTypeChange = (index: number, tipoTarea: TaskType) => {
    updateTask(index, {
      tipoTarea,
      config: defaultConfigForType(tipoTarea),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.subareaId) {
      setFormError("Selecciona una subárea antes de guardar la misión.");
      return;
    }

    setLoading(true);

    const payload: PathChallengeRequestDTO = {
      ...formData,
      tareas: formData.tareas.map(buildTaskPayload),
    };

    try {
      console.info("Creating PathChallenge payload:", payload);
      await pathChallengeService.create(payload, session?.backendJwt);
      router.push("/admin/pathchallenges");
    } catch (error) {
      console.error("Error creating path challenge:", error);
      const message =
        error instanceof Error ? error.message : "Error desconocido al crear la misión";
      setFormError(message);
      alert(`Error al crear la misión: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#7447D7]">
              PathChallenge builder
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#0E3E66]">
              Nueva Misión
            </h1>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600">
            {taskCountLabel}
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {formError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {formError}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-[1.5fr_1fr]">
            <Field label="Título">
              <input
                type="text"
                required
                className={sharedInputClass}
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />
            </Field>

            <Field label="Estado">
              <select
                className={sharedInputClass}
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              >
                <option value="Borrador">Borrador</option>
                <option value="Publicada">Publicada</option>
              </select>
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Subárea">
              <select
                required
                disabled={loadingSubareas || subareas.length === 0}
                className={sharedInputClass}
                value={formData.subareaId}
                onChange={(e) =>
                  setFormData({ ...formData, subareaId: Number(e.target.value) })
                }
              >
                <option value={0}>
                  {loadingSubareas ? "Cargando subáreas..." : "Selecciona una subárea"}
                </option>
                {subareas.map((subarea) => (
                  <option key={subarea.idSubarea} value={subarea.idSubarea}>
                    {subarea.areaNombre ? `${subarea.areaNombre} - ` : ""}
                    {subarea.nombre}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Dificultad">
              <select
                className={sharedInputClass}
                value={formData.dificultad}
                onChange={(e) =>
                  setFormData({ ...formData, dificultad: e.target.value })
                }
              >
                <option value="Facil">Fácil</option>
                <option value="Media">Media</option>
                <option value="Dificil">Difícil</option>
              </select>
            </Field>

            <Field label="XP">
              <input
                type="number"
                required
                min="0"
                className={sharedInputClass}
                value={formData.xp}
                onChange={(e) => setFormData({ ...formData, xp: Number(e.target.value) })}
              />
            </Field>
          </div>

          <section className="border-t border-slate-100 pt-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">Tareas</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Configura el tipo y los campos que verá el estudiante en la misión.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddTask}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E3E66] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900"
              >
                <Plus className="h-4 w-4" />
                Añadir tarea
              </button>
            </div>

            {formData.tareas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Aún no hay tareas configuradas.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Añade una tarea y elige su tipo para mostrar sus campos.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.tareas.map((task, index) => (
                  <TaskEditor
                    key={`${task.orden}-${index}`}
                    task={task}
                    index={index}
                    onRemove={() => handleRemoveTask(index)}
                    onUpdate={(updates) => updateTask(index, updates)}
                    onTypeChange={(tipoTarea) => handleTaskTypeChange(index, tipoTarea)}
                    onConfigUpdate={(updates) => updateTaskConfig(index, updates)}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingSubareas || !formData.subareaId}
              className="rounded-xl bg-[#0E3E66] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-900 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Misión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function TaskEditor({
  task,
  index,
  onRemove,
  onUpdate,
  onTypeChange,
  onConfigUpdate,
}: {
  task: AdminTaskForm;
  index: number;
  onRemove: () => void;
  onUpdate: (updates: Partial<AdminTaskForm>) => void;
  onTypeChange: (tipoTarea: TaskType) => void;
  onConfigUpdate: (updates: Partial<TaskConfig>) => void;
}) {
  const selectedTaskType = TASK_TYPES.find((type) => type.value === task.tipoTarea);

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="grid flex-1 gap-4 md:grid-cols-[0.75fr_1fr]">
          <Field label={`Tarea ${index + 1}`}>
            <input
              type="text"
              className={sharedInputClass}
              placeholder="Título interno de la tarea"
              value={task.titulo}
              onChange={(e) => onUpdate({ titulo: e.target.value })}
            />
          </Field>

          <Field label="Tipo">
            <select
              className={sharedInputClass}
              value={task.tipoTarea}
              onChange={(e) => onTypeChange(e.target.value as TaskType)}
            >
              {TASK_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50 hover:text-red-700"
          aria-label="Quitar tarea"
          title="Quitar tarea"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {selectedTaskType && (
        <p className="mt-3 text-xs font-medium text-slate-500">
          {selectedTaskType.description}
        </p>
      )}

      <div className="mt-4 grid gap-4">
        <Field label="Descripción corta">
          <input
            type="text"
            required
            className={sharedInputClass}
            placeholder="Resumen visible en el briefing"
            value={task.descripcion}
            onChange={(e) => onUpdate({ descripcion: e.target.value })}
          />
        </Field>

        <Field label="Contenido o instrucciones">
          <textarea
            rows={4}
            className={sharedInputClass}
            placeholder="Texto principal que verá el estudiante"
            value={task.contenido}
            onChange={(e) => onUpdate({ contenido: e.target.value })}
          />
        </Field>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-[#0E3E66]"
            checked={task.obligatoria}
            onChange={(e) => onUpdate({ obligatoria: e.target.checked })}
          />
          Tarea obligatoria para completar la misión
        </label>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <TaskTypeFields task={task} onConfigUpdate={onConfigUpdate} />
      </div>
    </article>
  );
}

function TaskTypeFields({
  task,
  onConfigUpdate,
}: {
  task: AdminTaskForm;
  onConfigUpdate: (updates: Partial<TaskConfig>) => void;
}) {
  const config = task.config;

  if (task.tipoTarea === "SCENARIO") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Rol asignado">
          <input
            className={compactInputClass}
            value={config.role ?? ""}
            onChange={(e) => onConfigUpdate({ role: e.target.value })}
          />
        </Field>
        <Field label="Objetivo">
          <input
            className={compactInputClass}
            value={config.goal ?? ""}
            onChange={(e) => onConfigUpdate({ goal: e.target.value })}
          />
        </Field>
        <Field label="Contexto">
          <input
            className={compactInputClass}
            value={config.context ?? ""}
            onChange={(e) => onConfigUpdate({ context: e.target.value })}
          />
        </Field>
        <ArrayField
          label="Restricciones"
          values={config.constraints ?? []}
          placeholder="Ej. Presupuesto limitado"
          onChange={(constraints) => onConfigUpdate({ constraints })}
        />
      </div>
    );
  }

  if (task.tipoTarea === "MULTI_SELECT") {
    return (
      <div className="grid gap-4">
        <Field label="Mínimo de opciones">
          <input
            type="number"
            min="1"
            className={compactInputClass}
            value={config.minSelections ?? 1}
            onChange={(e) =>
              onConfigUpdate({ minSelections: Number(e.target.value) })
            }
          />
        </Field>
        <ArrayField
          label="Opciones"
          values={config.options ?? []}
          placeholder="Opción visible para el estudiante"
          onChange={(options) => onConfigUpdate({ options })}
        />
      </div>
    );
  }

  if (task.tipoTarea === "RESOURCE_REVIEW" || task.tipoTarea === "PLAN_BUILDER") {
    const isPlanBuilder = task.tipoTarea === "PLAN_BUILDER";

    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Capacidad">
            <input
              type="number"
              min="0"
              className={compactInputClass}
              value={config.capacity ?? 0}
              onChange={(e) => onConfigUpdate({ capacity: Number(e.target.value) })}
            />
          </Field>
          {isPlanBuilder && (
            <>
              <Field label="Esfuerzo máximo">
                <input
                  type="number"
                  min="0"
                  className={compactInputClass}
                  value={config.validation?.maxEffort ?? config.capacity ?? 0}
                  onChange={(e) =>
                    onConfigUpdate({
                      validation: {
                        ...config.validation,
                        maxEffort: Number(e.target.value),
                      },
                    })
                  }
                />
              </Field>
              <Field label="Mínimo de items">
                <input
                  type="number"
                  min="1"
                  className={compactInputClass}
                  value={config.validation?.minItems ?? 1}
                  onChange={(e) =>
                    onConfigUpdate({
                      validation: {
                        ...config.validation,
                        minItems: Number(e.target.value),
                      },
                    })
                  }
                />
              </Field>
            </>
          )}
        </div>

        <BacklogItemsField
          items={config.items ?? []}
          onChange={(items) => onConfigUpdate({ items })}
        />
      </div>
    );
  }

  if (task.tipoTarea === "TEXT_RESPONSE") {
    return (
      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <Field label="Placeholder">
          <input
            className={compactInputClass}
            value={config.placeholder ?? ""}
            onChange={(e) => onConfigUpdate({ placeholder: e.target.value })}
          />
        </Field>
        <Field label="Mínimo caracteres">
          <input
            type="number"
            min="1"
            className={compactInputClass}
            value={config.minLength ?? 1}
            onChange={(e) => onConfigUpdate({ minLength: Number(e.target.value) })}
          />
        </Field>
      </div>
    );
  }

  if (task.tipoTarea === "FILE_UPLOAD") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título de carga">
          <input
            className={compactInputClass}
            value={config.uploadTitle ?? ""}
            onChange={(e) => onConfigUpdate({ uploadTitle: e.target.value })}
          />
        </Field>
        <Field label="Tamaño máximo MB">
          <input
            type="number"
            min="1"
            className={compactInputClass}
            value={config.maxSizeMb ?? 10}
            onChange={(e) => onConfigUpdate({ maxSizeMb: Number(e.target.value) })}
          />
        </Field>
        <Field label="Instrucción de carga">
          <input
            className={compactInputClass}
            value={config.uploadInstruction ?? ""}
            onChange={(e) => onConfigUpdate({ uploadInstruction: e.target.value })}
          />
        </Field>
        <Field label="Etiqueta de formatos">
          <input
            className={compactInputClass}
            value={config.acceptedLabel ?? ""}
            onChange={(e) => onConfigUpdate({ acceptedLabel: e.target.value })}
          />
        </Field>
        <div className="md:col-span-2">
          <ArrayField
            label="Extensiones permitidas"
            values={config.acceptedExtensions ?? []}
            placeholder=".pdf"
            onChange={(acceptedExtensions) =>
              onConfigUpdate({ acceptedExtensions })
            }
          />
        </div>
        <div className="md:col-span-2">
          <Field label="Texto de acompañamiento">
            <textarea
              rows={3}
              className={compactInputClass}
              value={config.audioText ?? ""}
              onChange={(e) => onConfigUpdate({ audioText: e.target.value })}
            />
          </Field>
        </div>
      </div>
    );
  }

  if (task.tipoTarea === "DOCUMENT_REVIEW") {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Título del documento">
            <input
              className={compactInputClass}
              value={config.documentTitle ?? ""}
              onChange={(e) => onConfigUpdate({ documentTitle: e.target.value })}
            />
          </Field>
          <Field label="Nombre del archivo">
            <input
              className={compactInputClass}
              value={config.documentName ?? ""}
              onChange={(e) => onConfigUpdate({ documentName: e.target.value })}
            />
          </Field>
          <Field label="Tipo de documento">
            <input
              className={compactInputClass}
              value={config.documentType ?? ""}
              onChange={(e) => onConfigUpdate({ documentType: e.target.value })}
            />
          </Field>
          <Field label="Etiqueta de descarga">
            <input
              className={compactInputClass}
              value={config.downloadLabel ?? ""}
              onChange={(e) => onConfigUpdate({ downloadLabel: e.target.value })}
            />
          </Field>
          <Field label="URL pública de descarga">
            <input
              className={compactInputClass}
              value={config.downloadUrl ?? ""}
              onChange={(e) => onConfigUpdate({ downloadUrl: e.target.value })}
            />
          </Field>
          <Field label="URL de vista previa">
            <input
              className={compactInputClass}
              value={config.previewImageUrl ?? ""}
              onChange={(e) => onConfigUpdate({ previewImageUrl: e.target.value })}
            />
          </Field>
        </div>

        <div className="grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-3">
          <Field label="Empresa">
            <input
              className={compactInputClass}
              value={config.companyInfo?.name ?? ""}
              onChange={(e) =>
                onConfigUpdate({
                  companyInfo: { ...config.companyInfo, name: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Área solicitante">
            <input
              className={compactInputClass}
              value={config.companyInfo?.area ?? ""}
              onChange={(e) =>
                onConfigUpdate({
                  companyInfo: { ...config.companyInfo, area: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Descripción empresa">
            <input
              className={compactInputClass}
              value={config.companyInfo?.description ?? ""}
              onChange={(e) =>
                onConfigUpdate({
                  companyInfo: {
                    ...config.companyInfo,
                    description: e.target.value,
                  },
                })
              }
            />
          </Field>
        </div>

        <ArrayField
          label="Objetivos de revisión"
          values={config.objectives ?? []}
          placeholder="Objetivo visible para el estudiante"
          onChange={(objectives) => onConfigUpdate({ objectives })}
        />
      </div>
    );
  }

  if (task.tipoTarea === "FINAL_REVIEW") {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Modo de revisión">
            <select
              className={compactInputClass}
              value={config.reviewMode ?? "SUMMARY_ONLY"}
              onChange={(e) =>
                onConfigUpdate({
                  reviewMode: e.target.value as TaskConfig["reviewMode"],
                })
              }
            >
              <option value="SUMMARY_ONLY">Resumen</option>
              <option value="SUBMISSION_REVIEW">Revisar entrega</option>
              <option value="FILE_COMPARISON">Comparar archivos</option>
            </select>
          </Field>
          <Field label="Tipo fuente">
            <select
              className={compactInputClass}
              value={config.comparison?.sourceTaskType ?? "DOCUMENT_REVIEW"}
              onChange={(e) =>
                onConfigUpdate({
                  comparison: {
                    ...config.comparison,
                    sourceTaskType: e.target.value,
                  },
                })
              }
            >
              {TASK_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tipo entrega">
            <select
              className={compactInputClass}
              value={config.comparison?.submissionTaskType ?? "FILE_UPLOAD"}
              onChange={(e) =>
                onConfigUpdate({
                  comparison: {
                    ...config.comparison,
                    submissionTaskType: e.target.value,
                  },
                })
              }
            >
              {TASK_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Título de revisión">
            <input
              className={compactInputClass}
              value={config.reviewTitle ?? ""}
              onChange={(e) => onConfigUpdate({ reviewTitle: e.target.value })}
            />
          </Field>
          <Field label="Texto de revisión">
            <input
              className={compactInputClass}
              value={config.reviewText ?? ""}
              onChange={(e) => onConfigUpdate({ reviewText: e.target.value })}
            />
          </Field>
        </div>

        <div className="grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-3">
          <Field label="Título modal éxito">
            <input
              className={compactInputClass}
              value={config.successModal?.title ?? ""}
              onChange={(e) =>
                onConfigUpdate({
                  successModal: { ...config.successModal, title: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Badge">
            <input
              className={compactInputClass}
              value={config.successModal?.badgeName ?? ""}
              onChange={(e) =>
                onConfigUpdate({
                  successModal: {
                    ...config.successModal,
                    badgeName: e.target.value,
                  },
                })
              }
            />
          </Field>
          <Field label="Puntos modal">
            <input
              type="number"
              min="0"
              className={compactInputClass}
              value={config.successModal?.points ?? 0}
              onChange={(e) =>
                onConfigUpdate({
                  successModal: {
                    ...config.successModal,
                    points: Number(e.target.value),
                  },
                })
              }
            />
          </Field>
          <div className="md:col-span-3">
            <Field label="Mensaje modal éxito">
              <input
                className={compactInputClass}
                value={config.successModal?.message ?? ""}
                onChange={(e) =>
                  onConfigUpdate({
                    successModal: {
                      ...config.successModal,
                      message: e.target.value,
                    },
                  })
                }
              />
            </Field>
          </div>
        </div>
      </div>
    );
  }

  return (
    <p className="text-sm text-slate-500">
      Este tipo usa la descripción y el contenido como información de lectura.
    </p>
  );
}

function ArrayField({
  label,
  values,
  placeholder,
  onChange,
}: {
  label: string;
  values: string[];
  placeholder: string;
  onChange: (values: string[]) => void;
}) {
  const currentValues = values.length > 0 ? values : [""];

  return (
    <div>
      <span className="mb-1 block text-sm font-bold text-slate-700">{label}</span>
      <div className="space-y-2">
        {currentValues.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              className={compactInputClass}
              placeholder={placeholder}
              value={value}
              onChange={(e) =>
                onChange(
                  currentValues.map((item, itemIndex) =>
                    itemIndex === index ? e.target.value : item,
                  ),
                )
              }
            />
            <button
              type="button"
              onClick={() =>
                onChange(currentValues.filter((_, itemIndex) => itemIndex !== index))
              }
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
              aria-label={`Quitar ${label}`}
              title={`Quitar ${label}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...currentValues, ""])}
        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
      >
        <Plus className="h-3.5 w-3.5" />
        Añadir
      </button>
    </div>
  );
}

function BacklogItemsField({
  items,
  onChange,
}: {
  items: BacklogItem[];
  onChange: (items: BacklogItem[]) => void;
}) {
  const currentItems = items.length > 0 ? items : [emptyBacklogItem()];

  const updateItem = (index: number, updates: Partial<BacklogItem>) => {
    onChange(
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item,
      ),
    );
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-slate-700">Items del backlog</span>
        <button
          type="button"
          onClick={() => onChange([...currentItems, emptyBacklogItem()])}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
        >
          <Plus className="h-3.5 w-3.5" />
          Añadir item
        </button>
      </div>

      <div className="space-y-3">
        {currentItems.map((item, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[0.5fr_1fr_0.45fr_0.7fr_0.7fr_1fr_auto]"
          >
            <input
              className={compactInputClass}
              placeholder="Código"
              value={item.code}
              onChange={(e) => updateItem(index, { code: e.target.value })}
            />
            <input
              className={compactInputClass}
              placeholder="Nombre"
              value={item.name}
              onChange={(e) => updateItem(index, { name: e.target.value })}
            />
            <input
              type="number"
              min="0"
              className={compactInputClass}
              placeholder="Pts"
              value={item.effort}
              onChange={(e) => updateItem(index, { effort: Number(e.target.value) })}
            />
            <input
              className={compactInputClass}
              placeholder="Valor"
              value={item.value ?? ""}
              onChange={(e) => updateItem(index, { value: e.target.value })}
            />
            <input
              className={compactInputClass}
              placeholder="Urgencia"
              value={item.urgency ?? ""}
              onChange={(e) => updateItem(index, { urgency: e.target.value })}
            />
            <input
              className={compactInputClass}
              placeholder="Dependencias separadas por coma"
              value={(item.dependencies ?? []).join(", ")}
              onChange={(e) =>
                updateItem(index, {
                  dependencies: e.target.value.split(",").map((value) => value.trim()),
                })
              }
            />
            <button
              type="button"
              onClick={() =>
                onChange(currentItems.filter((_, itemIndex) => itemIndex !== index))
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
              aria-label="Quitar item"
              title="Quitar item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
