// HU-EST-20 + HU-EST-21: Página de subáreas con lógica de primera visita
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import Footer from "@/components/Footer";

// --- Tipos ---
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

// --- Colores por área (igual que antes) ---
const areaConfig: Record<string, { titulo: string; emoji: string; colorFrom: string; colorTo: string }> = {
  "recursos-humanos": { titulo: "Recursos Humanos", emoji: "🧑‍💼", colorFrom: "#6f63ff", colorTo: "#8f4df0" },
  marketing:          { titulo: "Marketing",         emoji: "📱", colorFrom: "#ba42dc", colorTo: "#ef4bc8" },
  finanzas:           { titulo: "Finanzas",          emoji: "💰", colorFrom: "#f73586", colorTo: "#f2186c" },
  comercial:          { titulo: "Comercial",         emoji: "🤝", colorFrom: "#ff3f6e", colorTo: "#ff4438" },
  logistica:          { titulo: "Logística",         emoji: "📦", colorFrom: "#ff6a00", colorTo: "#f7931e" },
};

export default function SubareasPage({ params }: { params: Promise<{ area: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();

  const [area, setArea] = useState<string>("");
  const [subareas, setSubareas] = useState<SubAreaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolver params (Next.js 16)
  useEffect(() => {
    params.then(({ area }) => setArea(area));
  }, [params]);

  // Fetch subareas del backend
  useEffect(() => {
    if (!area || !session?.backendJwt) return;

    apiFetch<SubAreaDTO[]>(
      `/api/exploracion/areas/${area}/subareas`,
      {},
      session.backendJwt
    )
      .then(setSubareas)
      .catch(() => setError("No se pudieron cargar las subáreas"))
      .finally(() => setLoading(false));
  }, [area, session]);

  // Al hacer clic en una subárea
  const handleSeleccionarSubarea = async (subarea: SubAreaDTO) => {
    try {
      // Registrar visita (si ya fue visitada el backend lo ignora)
      await apiFetch(
        `/api/exploracion/subareas/${subarea.idSubarea}/visitar`,
        { method: "POST" },
        session?.backendJwt
      );

      if (subarea.yaVisitada) {
        // Ir directo al dashboard de la subárea
        router.push(`/areas/${area}/subareas/${subarea.idSubarea}/dashboard`);
      } else {
        // Ir a la página de descripción (primera vez)
        router.push(`/areas/${area}/subareas/${subarea.idSubarea}`);
      }
    } catch {
      router.push(`/areas/${area}/subareas/${subarea.idSubarea}`);
    }
  };

  const config = areaConfig[area] ?? { titulo: area, emoji: "📁", colorFrom: "#6f63ff", colorTo: "#8f4df0" };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#6f63ff]" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-slate-500">{error}</p>
      <Link href={`/areas/${area}`} className="text-[#6f63ff] hover:underline">
        Volver al área
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9f9fb]">
      {/* Volver */}
      <div className="mx-auto max-w-5xl px-6 pt-6">
        <Link
          href={`/areas/${area}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#6f63ff] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a {config.titulo}
        </Link>
      </div>

      {/* Header */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-4xl">{config.emoji}</span>
          <h1 className="text-3xl font-black text-slate-900 md:text-4xl">
            Especialízate en {config.titulo}
          </h1>
        </div>
        <p className="text-slate-500 ml-16">
          Elige una subárea para comenzar tu desarrollo profesional
        </p>
      </section>

      {/* Tarjetas */}
      <section className="mx-auto max-w-5xl px-6 pb-10">
        {subareas.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            No hay subáreas disponibles para esta área aún.
          </div>
        ) : (
          <div className={`grid gap-5 ${subareas.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            {subareas.map((subarea) => (
              <div
                key={subarea.idSubarea}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {/* Badge visitada */}
                {subarea.yaVisitada && (
                  <span
                    className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${config.colorFrom}, ${config.colorTo})` }}
                  >
                    En progreso
                  </span>
                )}

                {/* Nombre */}
                <h2 className="mb-1 text-lg font-bold text-slate-900 mt-2">
                  {subarea.nombre}
                </h2>

                {/* Descripción */}
                <p className="mb-5 text-sm text-slate-500 line-clamp-2">
                  {subarea.descripcion}
                </p>

                {/* Botón */}
                <button
                  onClick={() => handleSeleccionarSubarea(subarea)}
                  className={`w-full rounded-xl py-2.5 text-sm font-bold transition ${
                    subarea.yaVisitada
                      ? "text-white"
                      : "border border-slate-200 text-slate-700 hover:border-slate-400"
                  }`}
                  style={
                    subarea.yaVisitada
                      ? { background: `linear-gradient(135deg, ${config.colorFrom}, ${config.colorTo})` }
                      : {}
                  }
                >
                  {subarea.yaVisitada ? "Continuar" : "Comenzar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}