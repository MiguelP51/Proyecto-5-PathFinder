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
  nombre: string;
  descripcion: string;
  objetivos: string;
  habilidadesRelacionadas: string;
  yaVisitada: boolean;
}

const areaConfig: Record<string, { colorFrom: string; colorTo: string }> = {
  "recursos-humanos": { colorFrom: "#6f63ff", colorTo: "#8f4df0" },
  marketing:          { colorFrom: "#ba42dc", colorTo: "#ef4bc8" },
  finanzas:           { colorFrom: "#f73586", colorTo: "#f2186c" },
  comercial:          { colorFrom: "#ff3f6e", colorTo: "#ff4438" },
  logistica:          { colorFrom: "#ff6a00", colorTo: "#f7931e" },
};

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
      .then((data) => {
        // Si ya fue visitada, redirigir al dashboard directo
        if (data.yaVisitada) {
          router.replace(`/areas/${area}/subareas/${idSubarea}/dashboard`);
        } else {
          setSubarea(data);
        }
      })
      .catch(() => setError("No se pudo cargar la información de la subárea"))
      .finally(() => setLoading(false));
  }, [idSubarea, session, area, router]);

  const handleComenzar = () => {
    router.push(`/areas/${area}/subareas/${idSubarea}/dashboard`);
  };

  const config = areaConfig[area] ?? { colorFrom: "#6f63ff", colorTo: "#8f4df0" };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#6f63ff]" />
    </div>
  );

  if (error || !subarea) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-slate-500">{error ?? "Subárea no encontrada"}</p>
      <Link href={`/areas/${area}/subareas`} className="text-[#6f63ff] hover:underline">
        Volver a subáreas
      </Link>
    </div>
  );

  // Parsear habilidades (vienen como string separado por comas)
  const habilidades = subarea.habilidadesRelacionadas
    ?.split(",")
    .map((h) => h.trim())
    .filter(Boolean) ?? [];

  // Parsear objetivos (vienen como string separado por puntos o saltos)
  const objetivos = subarea.objetivos
    ?.split("\n")
    .map((o) => o.trim())
    .filter(Boolean) ?? [];

  return (
    <div className="min-h-screen bg-[#f9f9fb]">
      {/* Volver */}
      <div className="mx-auto max-w-3xl px-6 pt-6">
        <Link
          href={`/areas/${area}/subareas`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#6f63ff] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a subáreas
        </Link>
      </div>

      {/* Hero */}
      <section
        className="mx-auto max-w-3xl px-6 py-10"
      >
        <div
          className="rounded-2xl p-8 text-white mb-8"
          style={{ background: `linear-gradient(135deg, ${config.colorFrom}, ${config.colorTo})` }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-2">
            {subarea.areaNombre}
          </p>
          <h1 className="text-3xl font-black mb-3">{subarea.nombre}</h1>
          <p className="text-white/90 text-base leading-relaxed">
            {subarea.descripcion}
          </p>
        </div>

        {/* Objetivos */}
        {objetivos.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              🎯 Objetivos de aprendizaje
            </h2>
            <ul className="space-y-2">
              {objetivos.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span
                    className="mt-1 h-2 w-2 rounded-full shrink-0"
                    style={{ background: config.colorFrom }}
                  />
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Habilidades */}
        {habilidades.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              💡 Habilidades que desarrollarás
            </h2>
            <div className="flex flex-wrap gap-2">
              {habilidades.map((h, i) => (
                <span
                  key={i}
                  className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${config.colorFrom}, ${config.colorTo})` }}
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleComenzar}
          className="w-full rounded-2xl py-4 text-base font-black text-white shadow-lg transition hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${config.colorFrom}, ${config.colorTo})` }}
        >
          Comenzar subárea →
        </button>
      </section>

      <Footer />
    </div>
  );
}