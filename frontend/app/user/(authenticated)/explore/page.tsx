// frontend/app/user/(authenticated)/explore/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Search, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface SubAreaDTO {
  idSubarea: number;
  areaId: string;
  areaNombre: string;
  areaEmoji: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  objetivos: string;
  habilidadesRelacionadas: string;
  nivel: string;
  cantidadSkillPaths: number;
  cantidadPathChallenges: number;
  plataformasSkillPath: string;
  slug: string;
  yaVisitada: boolean;
  diagnosticoIniciado: boolean;
  diagnosticoCompletado: boolean;
  progreso: number | null;
}

interface AreaConfig {
  id: string;
  nombre: string;
  emoji: string;
  descripcion: string;
}

const AREAS_CONFIG: AreaConfig[] = [
  {
    id: "recursos-humanos",
    nombre: "Recursos Humanos",
    emoji: "🧑‍💼",
    descripcion:
      "Aprende a gestionar el talento humano y desarrollar estrategias de reclutamiento y selección",
  },
  {
    id: "marketing",
    nombre: "Marketing",
    emoji: "📱",
    descripcion:
      "Domina estrategias de marketing digital y tradicional para impulsar marcas",
  },
  {
    id: "finanzas",
    nombre: "Finanzas",
    emoji: "💰",
    descripcion: "Desarrolla habilidades en análisis financiero y gestión de inversiones",
  },
  {
    id: "comercial",
    nombre: "Comercial",
    emoji: "🤝",
    descripcion: "Impulsa las ventas y construye relaciones sólidas con los clientes",
  },
  {
    id: "logistica",
    nombre: "Logística",
    emoji: "📦",
    descripcion:
      "Optimiza el flujo de bienes, inventarios y operaciones de la cadena de suministro",
  },
];

interface AreaGroup extends AreaConfig {
  subareas: SubAreaDTO[];
}

export default function ExplorePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [areaGroups, setAreaGroups] = useState<AreaGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!session?.backendJwt) return;

    setLoading(true);
    setError(null);

    Promise.all(
      AREAS_CONFIG.map((area) =>
        apiFetch<SubAreaDTO[]>(
          `/api/exploracion/areas/${area.id}/subareas`,
          {},
          session.backendJwt,
        )
          .then((subareas) => ({ ...area, subareas }))
          .catch((err) => {
            console.error(`Error cargando subáreas de ${area.id}:`, err);
            return { ...area, subareas: [] as SubAreaDTO[] };
          }),
      ),
    )
      .then(setAreaGroups)
      .catch(() => setError("No se pudieron cargar las áreas y subáreas."))
      .finally(() => setLoading(false));
  }, [session]);

  const handleSeleccionarSubarea = async (areaId: string, subarea: SubAreaDTO) => {
    if (subarea.diagnosticoCompletado) {
      router.push(`/areas/${areaId}/subareas/${subarea.idSubarea}/dashboard`);
      return;
    }

    try {
      await apiFetch(
        `/api/exploracion/subareas/${subarea.idSubarea}/visitar`,
        { method: "POST" },
        session?.backendJwt,
      );
    } catch {
      // si falla el registro de visita, igual dejamos avanzar al estudiante
    }

    router.push(`/areas/${areaId}/subareas/${subarea.idSubarea}`);
  };

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();

    const base = areaGroups.filter((group) => group.subareas.length > 0);

    if (!term) return base;

    return base
      .map((group) => {
        const areaMatches = group.nombre.toLowerCase().includes(term);

        const subareas = areaMatches
          ? group.subareas
          : group.subareas.filter(
              (sa) =>
                sa.nombre.toLowerCase().includes(term) ||
                sa.descripcion?.toLowerCase().includes(term),
            );

        return { ...group, subareas };
      })
      .filter((group) => group.subareas.length > 0);
  }, [areaGroups, search]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7447D7]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 lg:text-4xl">
          Explora Áreas Profesionales
        </h1>
        <p className="mt-2 text-sm text-slate-600 lg:text-base">
          Descubre áreas y subáreas para desarrollar nuevas habilidades
        </p>

        <div className="relative mt-6 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar áreas o subáreas..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#7447D7]"
          />
        </div>

        <div className="mt-8 space-y-6">
          {filteredGroups.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              No encontramos áreas o subáreas que coincidan con tu búsqueda.
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div
                key={group.id}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{group.emoji}</span>
                    <div>
                      <h2 className="text-lg font-bold text-slate-950">{group.nombre}</h2>
                      <p className="mt-0.5 max-w-2xl text-sm text-slate-600">
                        {group.descripcion}
                      </p>
                    </div>
                  </div>

                  <span
                    className="shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ background: "#D43EE6" }}
                  >
                    {group.subareas.length} {group.subareas.length === 1 ? "subárea" : "subáreas"}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.subareas.map((subarea) => {
                    const activa = subarea.diagnosticoCompletado;

                    return (
                      <div
                        key={subarea.idSubarea}
                        className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-2xl">{subarea.emoji}</span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              activa
                                ? "bg-emerald-100 text-emerald-700"
                                : "border border-slate-200 bg-white text-slate-600"
                            }`}
                          >
                            {activa ? "Activa" : "Disponible"}
                          </span>
                        </div>

                        <h3 className="mt-3 text-base font-bold text-slate-950">
                          {subarea.nombre}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {subarea.descripcion}
                        </p>

                        <div className="mt-4 flex-1">
                          {activa && subarea.progreso !== null && subarea.progreso !== undefined && (
                            <div>
                              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-600">
                                <span>Progreso</span>
                                <span>{subarea.progreso}%</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-[#7447D7]"
                                  style={{ width: `${subarea.progreso}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleSeleccionarSubarea(group.id, subarea)}
                          className="mt-4 flex w-full items-center justify-between text-sm font-semibold text-[#7447D7] transition hover:text-[#6036c4]"
                        >
                          {activa
                            ? "Ver dashboard"
                            : subarea.diagnosticoIniciado
                              ? "Continuar diagnóstico"
                              : "Comenzar diagnóstico"}
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}