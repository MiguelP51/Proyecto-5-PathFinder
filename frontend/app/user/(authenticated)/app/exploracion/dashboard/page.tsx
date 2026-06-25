"use client";
// @ts-nocheck
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Award, BookOpen, Target, TrendingUp } from "lucide-react";
import Footer from "@/components/Footer";
import { apiFetch } from "@/lib/api";
import { useNotifications } from "@/hooks/useNotifications";
import type { SkillPath } from "@/lib/skillpath/types";
import type { StudentPathChallenge } from "@/lib/pathchallenge/student-types";
import { getStartedStudentPathChallenges } from "@/lib/pathchallenge/student-service";
import {
  getSkillPathStatusClasses,
  getSkillPathStatusLabel,
} from "@/lib/skillpath/display";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

const Icon = ({ className = "" }: { className?: string }) => (
  <span className={className} aria-hidden="true" />
);

const Bell = (props: { className?: string }) => <Icon {...props} />;
const Users = (props: { className?: string }) => <Icon {...props} />;
const ArrowRight = (props: { className?: string }) => <Icon {...props} />;
const Search = (props: { className?: string }) => <Icon {...props} />;
const Calendar = (props: { className?: string }) => <Icon {...props} />;

interface DashboardResumenResponse {
  nombre: string;
  avatar?: string;
  correo: string;
  xpTotal: number;
  nivel: number;
  xpSiguienteNivel: number;
  exploracionIniciada: boolean;
  habilidades: Array<{
    nombre: string;
    tipo: string;
    nivel: "BASICO" | "INTERMEDIO" | "AVANZADO" | string;
  }>;
}

interface EntrevistaProximaResponse {
  idEntrevista: number;
  mentorNombre: string;
  fecha: string;
  hora: string;
  tipo: string;
  estado: string;
  virtualLink: string | null;
}



interface InsigniaResponse {
  idInsignia: number;
  nombre: string;
  descripcion: string;
  emoji: string;
  colorFondo: string;
  fechaObtenida: string;
}

const formatFecha = (fechaStr: string) => {
  try {
    const parts = fechaStr.split("-");
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const formatted = date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    return fechaStr;
  } catch {
    return fechaStr;
  }
};

const getNivelHabilidadPorcentaje = (nivel?: string) => {
  switch (nivel) {
    case "BASICO":
      return 33;
    case "INTERMEDIO":
      return 66;
    case "AVANZADO":
      return 100;
    default:
      return 0;
  }
};

const formatNivelHabilidad = (nivel?: string) => {
  switch (nivel) {
    case "BASICO":
      return "Básico";
    case "INTERMEDIO":
      return "Intermedio";
    case "AVANZADO":
      return "Avanzado";
    default:
      return nivel ?? "Sin nivel";
  }
};

const formatTipoHabilidad = (tipo?: string) => {
  switch (tipo) {
    case "TECNICA":
      return "Técnica";
    case "BLANDA":
      return "Blanda";
    default:
      return tipo ?? "";
  }
};

const isSkillPathActivoDashboard = (status?: string) =>
    ["EN_PROGRESO", "CERTIFICADO_PENDIENTE", "VALIDACION_PENDIENTE", "RECHAZADO"].includes(
        status ?? "",
    );

const isSkillPathConXpDashboard = (status?: string) =>
    ["COMPLETADO", "VALIDADO"].includes(status ?? "");

const isPathChallengeActivoDashboard = (status?: string) =>
    status === "EN_PROGRESO";

const isPathChallengeConXpDashboard = (status?: string) =>
    status === "COMPLETADO";

const getSkillPathDashboardStatusLabel = (status?: string) =>
    status ? getSkillPathStatusLabel(status as any) ?? status : "Sin estado";

const getSkillPathDashboardStatusClasses = (status?: string) =>
    status
        ? getSkillPathStatusClasses(status as any) ??
        "bg-slate-100 text-slate-600 border-slate-200"
        : "bg-slate-100 text-slate-600 border-slate-200";

const getSkillPathDashboardActionLabel = (status?: string) =>
    status === "EN_PROGRESO" ? "Continuar SkillPath" : "Ver SkillPath";

const getChallengeDashboardStatusLabel = (status?: string) => {
  switch (status) {
    case "EN_PROGRESO":
      return "En progreso";
    case "COMPLETADO":
      return "Completado";
    case "DISPONIBLE":
      return "Disponible";
    default:
      return status ?? "Sin estado";
  }
};

const getChallengeDashboardStatusClasses = (status?: string) => {
  switch (status) {
    case "EN_PROGRESO":
      return "bg-purple-100 text-purple-700";
    case "COMPLETADO":
      return "bg-emerald-100 text-emerald-700";
    case "DISPONIBLE":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const getChallengeDashboardDifficultyClasses = (difficulty?: string) => {
  const value = difficulty?.toLowerCase() ?? "";

  if (
      value.includes("fácil") ||
      value.includes("facil") ||
      value.includes("básico") ||
      value.includes("basico")
  ) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (
      value.includes("difícil") ||
      value.includes("dificil") ||
      value.includes("avanzado")
  ) {
    return "bg-red-100 text-red-700";
  }

  return "bg-yellow-100 text-yellow-700";
};

const getChallengeDashboardActionLabel = (status?: string) =>
    status === "EN_PROGRESO" ? "Continuar misión" : "Revisar misión";

// ─── Datos mock ───────────────────────────────────────────────────────────────

const usuarioMock = {
  nombre: "María González",
  email: "maria.gonzalez@example.com",
  nivel: 5,
  xpActual: 2450,
  xpSiguienteNivel: 3000,
};

const habilidadesMock = [
  { nombre: "Gestión de Proyectos", nivel: 3, progreso: 3, total: 5 },
  { nombre: "Análisis de Datos", nivel: 2, progreso: 2, total: 5 },
  { nombre: "Comunicación Efectiva", nivel: 4, progreso: 4, total: 5 },
  { nombre: "Metodologías Ágiles", nivel: 2, progreso: 2, total: 5 },
];

void habilidadesMock;

// Notificaciones mock removidas en favor de las notificaciones dinámicas del backend

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ExploracionDashboardPage() {
  const { data: session, status } = useSession();
  const token = (session as { backendJwt?: string } | null)?.backendJwt;
  const { notificaciones: notificacionesReales, loading: notificationsLoading } = useNotifications(token);

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "ENTREVISTA_AGENDADA":
        return "Entrevista agendada";
      case "ENLACE_ENTREVISTA":
        return "Enlace de entrevista";
      case "FEEDBACK_DISPONIBLE":
        return "Feedback disponible";
      case "ENTREVISTA_CANCELADA":
        return "Entrevista cancelada";
      case "ENTREVISTA_REAGENDADA":
        return "Entrevista reagendada";
      default:
        return tipo.replace(/_/g, " ");
    }
  };

  const [dashboard, setDashboard] = useState<DashboardResumenResponse | null>(
    null,
  );
  const [skillPathsActivos, setSkillPathsActivos] = useState<SkillPath[]>([]);
  const [skillPathsActivosLoaded, setSkillPathsActivosLoaded] = useState(false);
  const [pathChallengesActivos, setPathChallengesActivos] = useState<StudentPathChallenge[]>([]);
  const [pathChallengesLoaded, setPathChallengesLoaded] = useState(false);
  const [insignias, setInsignias] = useState<InsigniaResponse[]>([]);
  const [insigniasLoaded, setInsigniasLoaded] = useState(false);
  const [entrevistasProximas, setEntrevistasProximas] = useState<
    EntrevistaProximaResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const xpSkillPaths = skillPathsActivos
      .filter((sp) => isSkillPathConXpDashboard(sp.status))
      .reduce((total, sp) => total + (sp.reward?.xpAwarded ?? sp.xp ?? 0), 0);

  const xpPathChallenges = pathChallengesActivos
      .filter((ch) => isPathChallengeConXpDashboard(ch.status))
      .reduce((total, ch) => total + (ch.reward?.xpAwarded ?? ch.xp ?? 0), 0);

  const xpTotalCalculado = xpSkillPaths + xpPathChallenges;

  const usuario = {
    nombre: dashboard?.nombre ?? usuarioMock.nombre,
    email: dashboard?.correo ?? usuarioMock.email,
    nivel: dashboard?.nivel ?? usuarioMock.nivel,
    xpActual: dashboard?.xpTotal ?? usuarioMock.xpActual,
    xpSiguienteNivel:
        dashboard?.xpSiguienteNivel ?? usuarioMock.xpSiguienteNivel,
  };

  const xpActualDashboard = xpTotalCalculado;
  const xpSiguienteNivelDashboard = usuario.xpSiguienteNivel || 1000;
  const porcentajeNivelDashboard = Math.min(
      100,
      Math.max(0, (xpActualDashboard / xpSiguienteNivelDashboard) * 100),
  );

  const metricas = [
    {
      valor: `${xpActualDashboard} XP`,
      label: "Experiencia total",
      badge: `Nivel ${usuario.nivel}`,
      icon: TrendingUp,
      iconColor: "text-[#7447D7]",
      badgeColor: "bg-[#7447D7] text-white",
    },
    {
      valor: insignias.length,
      label: "Insignias obtenidas",
      badge: null,
      icon: Award,
      iconColor: "text-yellow-500",
      badgeColor: "",
    },
    {
      valor: skillPathsActivos.length,
      label: "SkillPaths activos",
      badge: null,
      icon: BookOpen,
      iconColor: "text-[#7447D7]",
      badgeColor: "",
    },
    {
      valor: pathChallengesActivos.length,
      label: "PathChallenges activos",
      badge: null,
      icon: Target,
      iconColor: "text-emerald-500",
      badgeColor: "",
    },
  ];

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const backendJwt = (session as { backendJwt?: string } | null)?.backendJwt;
    let cancelled = false;

    apiFetch<DashboardResumenResponse>(
      "/api/estudiante/dashboard/resumen",
      {},
      backendJwt,
    )
      .then((data) => {
        if (!cancelled) {
          setDashboard(data);
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "No se pudo cargar el dashboard.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session, status]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const backendJwt = (session as { backendJwt?: string } | null)?.backendJwt;
    let cancelled = false;

    apiFetch<SkillPath[] | SkillPath | null>(
        "/api/skillpaths/estudiante/iniciados",
        {},
        backendJwt,
    )
      .then((data) => {
        if (!cancelled) {
          const list = data ? (Array.isArray(data) ? data : [data]) : [];
          setSkillPathsActivos(list);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSkillPathsActivos([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSkillPathsActivosLoaded(true);
        }
      });

    getStartedStudentPathChallenges(backendJwt)
        .then((data) => {
          if (!cancelled) {
            setPathChallengesActivos(Array.isArray(data) ? data : []);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setPathChallengesActivos([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setPathChallengesLoaded(true);
          }
        });

    apiFetch<InsigniaResponse[] | InsigniaResponse | null>(
      "/api/insignias",
      {},
      backendJwt,
    )
      .then((data) => {
        if (!cancelled) {
          const list = data ? (Array.isArray(data) ? data : [data]) : [];
          setInsignias(list);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInsignias([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setInsigniasLoaded(true);
        }
      });

    apiFetch<EntrevistaProximaResponse | EntrevistaProximaResponse[] | null>(
      "/api/entrevistas/estudiante",
      {},
      backendJwt,
    )
      .then((data) => {
        if (!cancelled) {
          const list = data ? (Array.isArray(data) ? data : [data]) : [];
          const valid = list.filter(
            (it): it is EntrevistaProximaResponse => !!(it && it.mentorNombre),
          );
          setEntrevistasProximas(valid);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEntrevistasProximas([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session, status]);


  const habilidades = dashboard?.habilidades ?? [];
  const hasSkillPathsActivos = skillPathsActivos.length > 0;
  const hasPathChallengesActivos = pathChallengesActivos.length > 0;
  const skillPathRecomendado =
      skillPathsActivos.find((sp) => sp.status === "EN_PROGRESO") ??
      skillPathsActivos[0] ??
      null;

  const progresoSkillPathRecomendado = skillPathRecomendado
      ? Math.min(Math.max(skillPathRecomendado.progressPercentage ?? 0, 0), 100)
      : 0;

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-[#081333]">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-bold text-red-600">Error al cargar</p>
          <p className="mt-2 text-sm text-slate-600">
            No se pudo cargar el dashboard porque no hay sesión activa.
          </p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-[#081333]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#7447D7]" />
          <p className="text-sm font-semibold text-slate-600">
            Cargando dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-[#081333]">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-bold text-red-600">Error al cargar</p>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="bg-slate-50 px-6 py-8 text-[#081333]">
        <div className="mx-auto max-w-7xl">
          {/* Bienvenida */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold md:text-3xl">
              ¡Bienvenido de vuelta, {usuario.nombre}!
            </h1>
            <p className="mt-1 text-slate-500">
              Continúa tu camino hacia el éxito profesional
            </p>
          </div>

          {/* Métricas */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {metricas.map(
              ({ valor, label, badge, icon: Icon, iconColor, badgeColor }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                    {badge && (
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs font-bold ${badgeColor}`}
                        >
                          {badge}
                        </span>
                    )}
                  </div>
                  <p className="mt-3 text-2xl font-extrabold">{valor}</p>
                  <p className="text-sm text-slate-500">{label}</p>
                </div>
              ),
            )}
          </div>

          {/* Layout dos columnas */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* ── Columna izquierda (2/3) ── */}
            <div className="space-y-6 lg:col-span-2">
              {/* Siguiente acción */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                  Siguiente acción recomendada
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7447D7]">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    {skillPathRecomendado ? (
                        <>
                          <p className="font-bold">
                            Continúa con {skillPathRecomendado.title}
                          </p>

                          <p className="mt-1 text-sm text-slate-600">
                            Llevas un {progresoSkillPathRecomendado}% de progreso.
                            {skillPathRecomendado.platform
                                ? ` Disponible en ${skillPathRecomendado.platform}.`
                                : " Sigue avanzando en tu ruta de aprendizaje."}
                          </p>

                          <Link
                              href={`/user/app/skillpaths/${skillPathRecomendado.id}`}
                              className="mt-3 inline-flex h-9 items-center rounded-lg bg-[#7447D7] px-4 text-sm font-bold text-white hover:bg-[#6338c4]"
                          >
                            Continuar aprendiendo
                          </Link>
                        </>
                    ) : (
                        <>
                          <p className="font-bold">Explora nuevos SkillPaths</p>

                          <p className="mt-1 text-sm text-slate-600">
                            Aún no tienes SkillPaths iniciados. Explora una subárea para comenzar una ruta de aprendizaje.
                          </p>

                          <Link
                              href="/user/app/exploracion-intro"
                              className="mt-3 inline-flex h-9 items-center rounded-lg bg-[#7447D7] px-4 text-sm font-bold text-white hover:bg-[#6338c4]"
                          >
                            Explorar SkillPaths
                          </Link>
                        </>
                    )}
                  </div>
                </div>
              </div>

              {/* PathChallenges activos */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-extrabold">
                      <Target className="mr-2 inline h-4 w-4 text-emerald-500" />
                      PathChallenges Activos
                    </h2>
                    <p className="text-xs text-slate-500">
                      Retos prácticos en progreso
                    </p>
                  </div>

                  <Link
                      href="/user/app/challenges"
                      className="text-sm font-semibold text-[#7447D7] hover:underline"
                  >
                    Ver todos
                  </Link>
                </div>

                <div className="space-y-4">
                  {!pathChallengesLoaded ? (
                      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                        Cargando PathChallenges activos...
                      </p>
                  ) : hasPathChallengesActivos ? (
                      pathChallengesActivos.map((ch) => (
                          <div
                              key={ch.idPathChallenge}
                              className="rounded-xl border border-slate-100 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold">{ch.title}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {ch.description}
                                </p>
                              </div>

                              <span
                                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${getChallengeDashboardStatusClasses(
                                      ch.status,
                                  )}`}
                              >
              {getChallengeDashboardStatusLabel(ch.status)}
            </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span
                className={`rounded-full px-2 py-0.5 font-bold ${getChallengeDashboardDifficultyClasses(
                    ch.difficulty,
                )}`}
            >
              {ch.difficulty}
            </span>

                              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
              ⏱ {ch.durationLabel}
            </span>

                              <span className="rounded-full bg-orange-100 px-2 py-0.5 font-semibold text-orange-700">
              ⭐ {ch.xp} XP
            </span>
                            </div>

                            <div className="mt-3">
                              <div className="mb-1 flex justify-between text-xs text-slate-500">
                                <span>Progreso</span>
                                <span>{ch.progressPercentage}%</span>
                              </div>

                              <div className="h-2 w-full rounded-full bg-slate-100">
                                <div
                                    className="h-2 rounded-full bg-emerald-500"
                                    style={{ width: `${ch.progressPercentage}%` }}
                                />
                              </div>

                              <p className="mt-2 text-xs text-slate-400">
                                {ch.completedTasksCount}/{ch.totalTasksCount} tareas completadas
                              </p>
                            </div>

                            <div className="mt-4 flex justify-end">
                              <Link
                                  href={`/user/app/challenges/${ch.idPathChallenge}?returnTo=/user/app/exploracion/dashboard&returnLabel=Volver%20al%20dashboard`}
                                  className="inline-flex items-center justify-center rounded-xl bg-[#7447D7] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#6338c5]"
                              >
                                {getChallengeDashboardActionLabel(ch.status)}
                              </Link>
                            </div>
                          </div>
                      ))
                  ) : (
                      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                        Sin PathChallenges activos
                      </p>
                  )}
                </div>
              </div>

              {/* SkillPaths activos */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-extrabold">
                      <BookOpen className="mr-2 inline h-4 w-4 text-[#7447D7]" />
                      SkillPaths Activos
                    </h2>
                    <p className="text-xs text-slate-500">
                      Tus rutas de aprendizaje en progreso
                    </p>
                  </div>

                  <Link
                      href="/user/app/skillpaths"
                      className="text-sm font-semibold text-[#7447D7] hover:underline"
                  >
                    Ver todos
                  </Link>
                </div>

                <div className="space-y-4">
                  {!skillPathsActivosLoaded ? (
                      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                        Cargando SkillPaths activos...
                      </p>
                  ) : hasSkillPathsActivos ? (
                      skillPathsActivos.map((sp) => (
                          <div
                              key={sp.id}
                              className="rounded-xl border border-slate-100 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold">{sp.title}</p>
                                <p className="text-xs text-slate-500">{sp.platform}</p>
                              </div>

                              <span
                                  className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-bold ${getSkillPathDashboardStatusClasses(
                                      sp.status,
                                  )}`}
                              >
              {getSkillPathDashboardStatusLabel(sp.status)}
            </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
              {sp.durationLabel}
            </span>

                              <span className="rounded-full bg-orange-100 px-2 py-0.5 font-semibold text-orange-700">
              ⭐ {sp.xp} XP
            </span>
                            </div>

                            <div className="mt-4 flex justify-end">
                              <Link
                                  href={`/user/app/skillpaths/${sp.id}?returnTo=/user/app/exploracion/dashboard`}
                                  className="inline-flex items-center justify-center rounded-xl bg-[#7447D7] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#6338c5]"
                              >
                                {getSkillPathDashboardActionLabel(sp.status)}
                              </Link>
                            </div>
                          </div>
                      ))
                  ) : (
                      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                        Sin SkillPaths activos
                      </p>
                  )}
                </div>
              </div>

              {/* Explorar nuevas áreas */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <Search className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-bold">
                      Explora nuevas áreas profesionales
                    </p>
                    <p className="text-sm text-slate-500">
                      Descubre más áreas y subáreas para expandir tus
                      habilidades
                    </p>
                  </div>
                </div>
                <button className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:border-[#7447D7] hover:text-[#7447D7]">
                  Explorar
                </button>
              </div>
            </div>

            {/* ── Columna derecha (1/3) — cuadros separados ── */}
            <div className="space-y-6">
              {/* Tu Progreso — cuadro propio */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-extrabold">Tu Progreso</h2>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">Nivel {usuario.nivel}</span>
                  <span className="ml-auto text-sm text-slate-500">
                    {xpActualDashboard} / {xpSiguienteNivelDashboard} XP
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full bg-linear-to-r from-[#7447D7] to-[#D43EE6]"
                    style={{
                      width: `${porcentajeNivelDashboard}%`,
                    }}
                  />
                </div>
              </div>

              {/* Tus Habilidades — cuadro propio */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-extrabold">Tus Habilidades</h2>
                <div className="space-y-3">
                  {habilidades.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                        Aún no se han registrado habilidades en tu perfil.
                      </p>
                  ) : (
                      habilidades.map((h) => {
                        const porcentajeNivel = getNivelHabilidadPorcentaje(h.nivel);

                        return (
                            <div key={`${h.nombre}-${h.tipo}`}>
                              <div className="flex items-center justify-between gap-3 text-sm">
                                <div>
                                  <span className="font-medium">{h.nombre}</span>
                                  <p className="text-xs text-slate-400">
                                    {formatTipoHabilidad(h.tipo)}
                                  </p>
                                </div>

                                <span className="text-xs font-semibold text-[#7447D7]">
                                  Nivel {formatNivelHabilidad(h.nivel)}
                                </span>
                              </div>

                              <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                                <div
                                    className="h-1.5 rounded-full bg-[#7447D7]"
                                    style={{ width: `${porcentajeNivel}%` }}
                                />
                              </div>
                            </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Próximas Entrevistas — cuadro propio */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-extrabold">
                  <Calendar className="mr-2 inline h-4 w-4 text-[#7447D7]" />
                  Próximas Entrevistas
                </h2>
                <div className="space-y-3">
                  {entrevistasProximas.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Sin entrevistas próximas
                    </p>
                  ) : (
                    entrevistasProximas.map((e) => (
                      <div
                        key={e.idEntrevista}
                        className="rounded-xl border border-slate-100 p-3"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#7447D7]" />
                          <p className="font-semibold">{e.mentorNombre}</p>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 font-medium">{formatFecha(e.fecha)}</p>
                        <p className="text-xs text-slate-500">{e.hora} hs</p>
                      </div>
                    ))
                  )}
                </div>
                <Link href="/user/home" className="mt-3 w-full rounded-xl border border-slate-200 py-2 text-sm font-semibold text-center block transition hover:border-[#7447D7] hover:text-[#7447D7]">
                  Ver todas
                </Link>
              </div>

              {/* Insignias recientes — cuadro propio */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-extrabold">Insignias Recientes</h2>
                <div className="grid grid-cols-2 gap-3">
                  {!insigniasLoaded ? (
                    <p className="col-span-2 rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                      Cargando insignias...
                    </p>
                  ) : insignias.length === 0 ? (
                    <p className="col-span-2 rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                      Sin insignias obtenidas
                    </p>
                  ) : (
                    insignias.map((ins) => (
                      <div
                        key={ins.idInsignia}
                        className="flex flex-col items-center rounded-xl border border-slate-100 p-3 text-center"
                      >
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${ins.colorFondo}`}
                        >
                          {ins.emoji}
                        </div>
                        <p className="mt-2 text-xs font-bold">{ins.nombre}</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {ins.descripcion}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold text-emerald-600">
                          ✓ Obtenida {ins.fechaObtenida}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Notificaciones — cuadro propio */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-extrabold">
                  <Bell className="mr-2 inline h-4 w-4" />
                  Notificaciones
                </h2>
                <div className="space-y-3">
                  {notificationsLoading ? (
                    <p className="text-xs text-slate-500 py-2">
                      Cargando notificaciones...
                    </p>
                  ) : notificacionesReales.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">
                      Sin notificaciones recientes
                    </p>
                  ) : (
                    notificacionesReales.slice(0, 3).map((n) => (
                      <div
                        key={n.idNotificacion}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                      >
                        <p className="text-sm font-bold">{getTipoLabel(n.tipo)}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {n.mensaje}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
