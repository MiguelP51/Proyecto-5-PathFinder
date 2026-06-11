// HU-EST-21: Descripción de subárea — primera visita
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import Footer from "@/components/Footer";

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
  yaVisitada: boolean;
}

export default function SubAreaDetallePage({
  params,
}: {
  params: Promise<{ area: string; idSubarea: string }>;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const [area, setArea] = useState("");
  const [idSubarea, setIdSubarea] = useState("");
  const [subarea, setSubarea] = useState<SubAreaDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ area, idSubarea }) => {
      setArea(area);
      setIdSubarea(idSubarea);
    });
  }, [params]);

  useEffect(() => {
    if (!idSubarea || !session?.backendJwt) return;
    apiFetch<SubAreaDTO>(
      `/api/exploracion/subareas/${idSubarea}`,
      {},
      session.backendJwt
    )
      .then((data) => setSubarea(data))
      .catch(() => setError("No se pudo cargar la información de la subárea"))
      .finally(() => setLoading(false));
  }, [idSubarea, session, area, router]);

  const handleComenzar = () => {
    router.push(`/areas/${area}/subareas/${idSubarea}/diagnostico`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5ff]">
      <Loader2 className="h-8 w-8 animate-spin text-[#6f63ff]" />
    </div>
  );

  if (error || !subarea) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f5f5ff]">
      <p className="text-slate-500">{error ?? "Subárea no encontrada"}</p>
      <Link href={`/areas/${area}/subareas`} className="text-[#6f63ff] hover:underline">
        Volver a subáreas
      </Link>
    </div>
  );

  const habilidades = subarea.habilidadesRelacionadas
    ?.split(",").map((h) => h.trim()).filter(Boolean) ?? [];

  const plataformas = subarea.plataformasSkillPath
    ?.split(",").map((p) => p.trim()).filter(Boolean) ?? [];

  return (
    <div className="min-h-screen bg-[#f5f5ff]">
      <div className="mx-auto max-w-3xl px-6 pt-6">
        <Link
          href={`/areas/${area}/subareas`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#6f63ff] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a subáreas
        </Link>
      </div>

      <section className="mx-auto max-w-3xl px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3 text-3xl">
          <span>{subarea.areaEmoji}</span>
          <span className="text-slate-400 font-light">/</span>
          <span>{subarea.emoji}</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">{subarea.nombre}</h1>
        <p className="text-slate-500">{subarea.descripcion}</p>
      </section>

      <section className="mx-auto max-w-3xl px-6 mb-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">¿Qué aprenderás?</h2>
          <p className="text-sm text-slate-500 mb-6">
            En esta subárea desarrollarás habilidades clave que te permitirán destacar en el
            mercado laboral. Aprenderás tanto conceptos teóricos como aplicaciones prácticas
            mediante nuestro sistema de SkillPaths y PathChallenges.
          </p>

          <div className="flex items-start gap-3 mb-5">
            <span className="text-xl mt-0.5">🎯</span>
            <div>
              <p className="font-semibold text-slate-800 mb-2">Habilidades asociadas</p>
              {habilidades.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {habilidades.map((h, i) => (
                    <span key={i} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
                      {h}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Sin habilidades registradas</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 mb-5">
            <span className="text-xl mt-0.5">📖</span>
            <div>
              <p className="font-semibold text-slate-800 mb-1">SkillPath recomendado</p>
              <p className="text-sm text-slate-500 mb-2">
                {subarea.cantidadSkillPaths} rutas de aprendizaje disponibles con cursos de plataformas reconocidas
              </p>
              {plataformas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {plataformas.map((p, i) => (
                    <span key={i} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">🏆</span>
            <div>
              <p className="font-semibold text-slate-800 mb-1">PathChallenge relacionado</p>
              <p className="text-sm text-slate-500">
                {subarea.cantidadPathChallenges} retos prácticos para aplicar tus conocimientos en situaciones reales
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-10">
        <div
          className="rounded-2xl p-8 text-center text-white"
          style={{ background: "linear-gradient(135deg, #6f63ff, #c850c0)" }}
        >
          <h2 className="text-xl font-black mb-2">Comienza tu diagnóstico inicial</h2>
          <p className="text-white/80 text-sm mb-6">
            Realiza una evaluación rápida para identificar tu nivel actual y recibir recomendaciones personalizadas
          </p>
          <button
            onClick={handleComenzar}
            className="rounded-full bg-white px-8 py-3 text-sm font-bold text-[#6f63ff] hover:bg-white/90 transition"
          >
            Iniciar diagnóstico
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}