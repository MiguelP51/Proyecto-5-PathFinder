// HU-EST-20: Explorar área específica
// Ruta: /areas/[area]
// Accesible desde el botón "Explorar área" en /areas
// Muestra: hero del área + funciones específicas + subáreas (Especializa tu carrera)
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Footer from "@/components/Footer";
import { apiFetch } from "@/lib/api";

interface PublicSubAreaResponseDTO {
  idSubarea: number;
  nombre: string;
  emoji: string;
  descripcion: string;
  nivel: string;
  cantidadSkillPaths: number;
  cantidadPathChallenges: number;
  plataformasSkillPath: string;
  slug: string;
}

interface PublicAreaResponseDTO {
  idArea: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  imagenUrl: string;
  tagline: string;
  funciones: string;
  colorFrom: string;
  colorTo: string;
  subareas: PublicSubAreaResponseDTO[];
}

export default async function AreaDetailPage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area: areaId } = await params;
  const area = await apiFetch<PublicAreaResponseDTO>(`/api/public/exploracion/areas/${areaId}`).catch(() => null);

  if (!area) notFound();

  const colorFrom = area.colorFrom || "#6f63ff";
  const colorTo = area.colorTo || "#8f4df0";

  const imageUrl = area.imagenUrl
    ? (area.imagenUrl.startsWith("areas/")
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/areas/${area.idArea}/imagen`
      : area.imagenUrl)
    : "/areas/placeholder.jpg";

  // Parse functions
  const funcionesList = area.funciones
    ? area.funciones.split("|").map((f) => f.trim()).filter(Boolean)
    : [];

  // Divide funciones en dos columnas
  const mitad = Math.ceil(funcionesList.length / 2);
  const col1 = funcionesList.slice(0, mitad);
  const col2 = funcionesList.slice(mitad);

  return (
    <div className="min-h-screen bg-[#f9f9fb]">
      {/* ── Volver a áreas ── */}
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <Link
          href="/areas"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#6f63ff] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a áreas
        </Link>
      </div>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Lado izquierdo */}
          <div>
            {/* Badge */}
            <span
              className="mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
              }}
            >
              {area.nombre}
            </span>

            {/* Ícono + Título */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{area.emoji || "📁"}</span>
              <h1 className="text-4xl font-black text-slate-900 md:text-5xl">
                {area.nombre}
              </h1>
            </div>

            {/* Tagline */}
            <p className="mb-4 text-lg font-semibold text-slate-700 leading-snug">
              {area.tagline}
            </p>

            {/* Descripción */}
            <p className="mb-8 text-slate-500 leading-relaxed">
              {area.descripcion}
            </p>

            {/* Botón */}
            <a
              href={`/areas/${area.idArea}/subareas`}
              className="inline-flex items-center rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
              }}
            >
              Explorar subáreas
            </a>
          </div>

          {/* Imagen */}
          <div>
            <img
              src={imageUrl}
              alt={area.nombre}
              className="w-full h-80 rounded-2xl object-cover shadow-xl lg:h-96"
            />
          </div>
        </div>
      </section>

      {/* ── Funciones específicas ── */}
      {funcionesList.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-black text-slate-900">
              Funciones específicas del área
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {[...col1, ...col2].map((funcion) => (
                <div key={funcion} className="flex items-center gap-3">
                  <CheckCircle2
                    className="h-5 w-5 flex-shrink-0"
                    style={{ color: colorFrom }}
                  />
                  <span className="text-sm text-slate-700">{funcion}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Especializa tu carrera ── */}
      <section id="subareas" className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="mb-2 text-2xl font-black text-slate-900">
          Especializa tu carrera
        </h2>
        <p className="mb-8 text-slate-500">
          Explora las {area.subareas?.length || 0} subáreas especializadas de{" "}
          {area.nombre} y comienza tu desarrollo profesional.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {area.subareas && area.subareas.length > 0 ? (
            area.subareas.map((subarea) => (
              <a
                href={`/areas/${area.idArea}/subareas`}
                key={subarea.idSubarea}
                className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
              >
                <span className="mb-4 block text-3xl">{subarea.emoji || "🎯"}</span>
                <h3 className="mb-1 font-bold text-slate-900">
                  {subarea.nombre}
                </h3>
                <p className="text-sm text-slate-500">{subarea.descripcion}</p>
              </a>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-slate-400">
              No hay subáreas configuradas para esta área aún.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
