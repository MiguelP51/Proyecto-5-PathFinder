// HU-EST-22: Dashboard de subárea
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, BookOpen, Target, Award, TrendingUp, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";

interface SubAreaDTO {
  idSubarea: number;
  nombre: string;
  descripcion: string;
  areaEmoji: string;
  areaNombre: string;
  emoji: string;
  slug: string;
}

interface SkillPathDTO {
  id: string;
  title: string;
  platform: string;
  description: string;
  difficulty: string;
  durationLabel: string;
  xp: number;
  progressPercentage: number;
  status: string;
  isRecommended: boolean;
}

// PathChallenges mockeados por ahora (HU-29)
const MOCK_CHALLENGES = [
  {
    id: "1",
    title: "Diseña un proceso de reclutamiento",
    description: "Crea un proceso completo de atracción y selección de talento",
    difficulty: "Medio",
    durationLabel: "3 horas",
    xp: 350,
    progreso: 0,
    estado: "DISPONIBLE",
  },
  {
    id: "2",
    title: "Entrevista por competencias",
    description: "Realiza una entrevista simulada usando el modelo STAR",
    difficulty: "Fácil",
    durationLabel: "1 hora",
    xp: 200,
    progreso: 0,
    estado: "DISPONIBLE",
  },
];

const difficultyColor: Record<string, string> = {
  BASICO: "bg-green-100 text-green-700",
  INTERMEDIO: "bg-yellow-100 text-yellow-700",
  AVANZADO: "bg-red-100 text-red-700",
  Fácil: "bg-green-100 text-green-700",
  Medio: "bg-yellow-100 text-yellow-700",
  Difícil: "bg-red-100 text-red-700",
};

const statusColor: Record<string, string> = {
  EN_PROGRESO: "bg-blue-100 text-blue-700",
  COMPLETADO: "bg-green-100 text-green-700",
  DISPONIBLE: "bg-slate-100 text-slate-600",
};

const statusLabel: Record<string, string> = {
  EN_PROGRESO: "En progreso",
  COMPLETADO: "Completado",
  DISPONIBLE: "Disponible",
};

export default function DashboardSubareaPage({
  params,
}: {
  params: Promise<{ area: string; idSubarea: string }>;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  // función para ir al dashboard individual de cada SkillPath
  const goToSkillPathDashboard = (skillPathId: string) => {
    router.push(`/user/app/skillpaths/${skillPathId}`);
  };

  const [area, setArea] = useState("");
  const [idSubarea, setIdSubarea] = useState("");
  const [subarea, setSubarea] = useState<SubAreaDTO | null>(null);
  const [skillPaths, setSkillPaths] = useState<SkillPathDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ area, idSubarea }) => {
      setArea(area);
      setIdSubarea(idSubarea);
    });
  }, [params]);

  useEffect(() => {
    if (!idSubarea || !session?.backendJwt) return;

    Promise.all([
      apiFetch<SubAreaDTO>(`/api/exploracion/subareas/${idSubarea}`, {}, session.backendJwt),
    ])
      .then(([subareaData]) => {
        setSubarea(subareaData);
        // Cargar SkillPaths usando el slug de la subárea
        if (subareaData.slug) {
          return apiFetch<SkillPathDTO[]>(
            `/api/skillpaths/estudiante?subareaId=${subareaData.slug}`,
            {},
            session.backendJwt
          );
        }
        return [];
      })
      .then((spData) => setSkillPaths(spData as SkillPathDTO[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [idSubarea, session]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f9fb]">
      <Loader2 className="h-8 w-8 animate-spin text-[#6f63ff]" />
    </div>
  );

  if (!subarea) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-slate-500">No se pudo cargar el dashboard</p>
      <Link href={`/areas/${area}/subareas`} className="text-[#6f63ff] hover:underline">
        Volver a subáreas
      </Link>
    </div>
  );

  // Calcular stats
  const skillPathsCompletados = skillPaths.filter(sp => sp.status === "COMPLETADO").length;
  const challengesCompletados = MOCK_CHALLENGES.filter(c => c.estado === "COMPLETADO").length;
  const progresoGeneral = skillPaths.length > 0
    ? Math.round(skillPaths.reduce((acc, sp) => acc + sp.progressPercentage, 0) / skillPaths.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#f9f9fb]">
      <div className="mx-auto max-w-6xl px-6 py-6">

        {/* Volver */}
        <Link
          href={`/areas/${area}/subareas`}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#6f63ff] transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a explorar
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <span className="text-4xl">{subarea.emoji}</span>
          <div>
            <p className="text-sm text-slate-500 flex items-center gap-1 mb-1">
              <span>{subarea.areaEmoji}</span> {subarea.areaNombre}
            </p>
            <h1 className="text-3xl font-black text-slate-900">{subarea.nombre}</h1>
            <p className="text-slate-500 text-sm mt-1">{subarea.descripcion}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <TrendingUp className="h-5 w-5 text-blue-500" />, value: `${progresoGeneral}%`, label: "Progreso general" },
            { icon: <BookOpen className="h-5 w-5 text-purple-500" />, value: `${skillPathsCompletados}/${skillPaths.length}`, label: "SkillPaths completados" },
            { icon: <Target className="h-5 w-5 text-green-500" />, value: `${challengesCompletados}/${MOCK_CHALLENGES.length}`, label: "Challenges completados" },
            { icon: <Award className="h-5 w-5 text-yellow-500" />, value: "0", label: "Habilidades trabajadas" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              {stat.icon}
              <p className="text-2xl font-black text-slate-900 mt-2">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna izquierda */}
          <div className="lg:col-span-2 space-y-6">

            {/* SkillPaths */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-500" /> SkillPaths
                </h2>
                <button className="text-xs text-[#6f63ff] hover:underline">Ver todos</button>
              </div>
              <p className="text-xs text-slate-400 mb-4">Rutas de aprendizaje para esta subárea</p>

              {skillPaths.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No hay SkillPaths disponibles aún</p>
              ) : (
                <div className="space-y-3">
                  {skillPaths.map((sp) => (
                    <div key={sp.id} className="border border-slate-100 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-900">{sp.title}</p>
                            <p className="text-xs text-slate-400">{sp.platform}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[sp.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {statusLabel[sp.status] ?? sp.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-3 ml-11">
                        <span>⏱ {sp.durationLabel}</span>
                        <span>⚡ {sp.xp} XP</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${difficultyColor[sp.difficulty] ?? "bg-slate-100 text-slate-600"}`}>
                          {sp.difficulty}
                        </span>
                      </div>
                      <div className="ml-11">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Progreso</span>
                          <span>{sp.progressPercentage}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#6f63ff]"
                            style={{ width: `${sp.progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* botón individual para abrir el dashboard de este SkillPath */}
                      <div className="ml-11 mt-4">
                        <button
                            type="button"
                            onClick={() => goToSkillPathDashboard(sp.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6f63ff] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#5b50df]"
                        >
                          {sp.status === "DISPONIBLE" ? "Iniciar SkillPath" : "Continuar SkillPath"}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PathChallenges */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" /> PathChallenges
                </h2>
                <button className="text-xs text-[#6f63ff] hover:underline">Ver todos</button>
              </div>
              <p className="text-xs text-slate-400 mb-4">Retos prácticos para aplicar tus conocimientos</p>

              <div className="space-y-3">
                {MOCK_CHALLENGES.map((ch) => (
                  <div key={ch.id} className="border border-slate-100 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-sm text-slate-900">{ch.title}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColor[ch.difficulty]}`}>
                        {ch.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{ch.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>⏱ {ch.durationLabel}</span>
                      <span>⚡ {ch.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">

            {/* Habilidades */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-1">Habilidades</h3>
              <p className="text-xs text-slate-400 mb-4">Habilidades desarrolladas en esta subárea</p>
              <p className="text-sm text-slate-400 text-center py-4">Sin habilidades registradas aún</p>
            </div>

            {/* Actualiza diagnóstico */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1 text-sm">Actualiza tu diagnóstico</h3>
              <p className="text-xs text-slate-400 mb-4">Realiza el diagnóstico nuevamente para ver tu progreso</p>
              <button
                onClick={() => router.push(`/areas/${area}/subareas/${idSubarea}/diagnostico`)}
                className="w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:border-[#6f63ff] hover:text-[#6f63ff] transition"
              >
                Realizar diagnóstico
              </button>
            </div>

            {/* Progreso General */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Progreso General</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Completado</span>
                    <span>{progresoGeneral}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#6f63ff]"
                      style={{ width: `${progresoGeneral}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>SkillPaths:</span>
                  <span>{skillPathsCompletados}/{skillPaths.length}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Challenges:</span>
                  <span>{challengesCompletados}/{MOCK_CHALLENGES.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
