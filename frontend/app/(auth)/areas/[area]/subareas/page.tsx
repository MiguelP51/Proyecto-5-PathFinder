// HU-EST-20: Página de subáreas de un área específica
// Ruta: /areas/[area]/subareas
// Accesible desde el botón "Explorar subáreas" en /areas/[area]

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

// ─── Datos de subáreas por área ───────────────────────────────────────────────
const subareasData = {
  "recursos-humanos": {
    titulo: "Recursos Humanos",
    emoji: "👥",
    colorFrom: "#6f63ff",
    colorTo: "#8f4df0",
    subareas: [
      {
        id: "reclutamiento-seleccion",
        emoji: "🎯",
        nombre: "Reclutamiento y Selección",
        descripcion: "Procesos de atracción y selección de talento",
        habilidades: 0,
        nivel: "Principiante",
      },
      {
        id: "gestion-desempeno",
        emoji: "📊",
        nombre: "Gestión del Desempeño",
        descripcion: "Evaluación y desarrollo de colaboradores",
        habilidades: 0,
        nivel: "Intermedio",
      },
      {
        id: "clima-organizacional",
        emoji: "✨",
        nombre: "Clima Organizacional",
        descripcion: "Cultura y ambiente laboral",
        habilidades: 0,
        nivel: "Avanzado",
      },
    ],
  },
  marketing: {
    titulo: "Marketing",
    emoji: "📱",
    colorFrom: "#ba42dc",
    colorTo: "#ef4bc8",
    subareas: [
      {
        id: "marketing-digital",
        emoji: "💻",
        nombre: "Marketing Digital",
        descripcion: "SEO, SEM y estrategias digitales",
        habilidades: 0,
        nivel: "Principiante",
      },
      {
        id: "social-media",
        emoji: "📱",
        nombre: "Social Media",
        descripcion: "Gestión de redes sociales",
        habilidades: 0,
        nivel: "Intermedio",
      },
      {
        id: "branding",
        emoji: "🎨",
        nombre: "Branding",
        descripcion: "Construcción y gestión de marca",
        habilidades: 0,
        nivel: "Avanzado",
      },
    ],
  },
  finanzas: {
    titulo: "Finanzas",
    emoji: "💰",
    colorFrom: "#f73586",
    colorTo: "#f2186c",
    subareas: [
      {
        id: "analisis-financiero",
        emoji: "📈",
        nombre: "Análisis Financiero",
        descripcion: "Evaluación de estados financieros",
        habilidades: 0,
        nivel: "Principiante",
      },
      {
        id: "gestion-inversiones",
        emoji: "💹",
        nombre: "Gestión de Inversiones",
        descripcion: "Portafolios y estrategias de inversión",
        habilidades: 0,
        nivel: "Intermedio",
      },
    ],
  },
  comercial: {
    titulo: "Comercial",
    emoji: "🤝",
    colorFrom: "#ff3f6e",
    colorTo: "#ff4438",
    subareas: [
      {
        id: "tecnicas-ventas",
        emoji: "💼",
        nombre: "Técnicas de Ventas",
        descripcion: "Estrategias de venta efectivas",
        habilidades: 0,
        nivel: "Principiante",
      },
      {
        id: "negociacion",
        emoji: "🤝",
        nombre: "Negociación",
        descripcion: "Habilidades de negociación comercial",
        habilidades: 0,
        nivel: "Intermedio",
      },
    ],
  },
  logistica: {
    titulo: "Logística",
    emoji: "📦",
    colorFrom: "#ff6a00",
    colorTo: "#f7931e",
    subareas: [
      {
        id: "cadena-suministro",
        emoji: "🔗",
        nombre: "Cadena de Suministro",
        descripcion: "Gestión de supply chain",
        habilidades: 0,
        nivel: "Principiante",
      },
      {
        id: "gestion-inventarios",
        emoji: "📊",
        nombre: "Gestión de Inventarios",
        descripcion: "Control y optimización de inventarios",
        habilidades: 0,
        nivel: "Intermedio",
      },
    ],
  },
};

// ─── Página ───────────────────────────────────────────────────────────────────
export default async function SubareasPage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area } = await params;
  const data = subareasData[area as keyof typeof subareasData];

  if (!data) notFound();

  return (
    <div className="min-h-screen bg-[#f9f9fb]">
      {/* ── Volver ── */}
      <div className="mx-auto max-w-5xl px-6 pt-6">
        <Link
          href={`/areas/${area}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#6f63ff] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a {data.titulo}
        </Link>
      </div>

      {/* ── Header ── */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-4xl">{data.emoji}</span>
          <h1 className="text-3xl font-black text-slate-900 md:text-4xl">
            Especialízate en {data.titulo}
          </h1>
        </div>
        <p className="text-slate-500 ml-16">
          Elige una subárea para comenzar tu desarrollo profesional
        </p>
      </section>

      {/* ── Tarjetas de subáreas ── */}
      <section className="mx-auto max-w-5xl px-6 pb-10">
        <div
          className={`grid gap-5 ${data.subareas.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}
        >
          {data.subareas.map((subarea) => {
            const progreso = 0; // TODO: conectar con backend
            const iniciado = progreso > 0;

            return (
              <div
                key={subarea.id}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {/* Badge progreso */}
                {iniciado && (
                  <span
                    className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${data.colorFrom}, ${data.colorTo})`,
                    }}
                  >
                    {progreso}% completado
                  </span>
                )}

                {/* Emoji */}
                <span className="mb-4 block text-4xl">{subarea.emoji}</span>

                {/* Nombre y descripción */}
                <h2 className="mb-1 text-lg font-bold text-slate-900">
                  {subarea.nombre}
                </h2>
                <p className="mb-4 text-sm text-slate-500">
                  {subarea.descripcion}
                </p>

                {/* Habilidades y nivel */}
                <p className="mb-1 text-sm text-slate-600">
                  <span className="font-semibold">{subarea.habilidades}</span>{" "}
                  habilidades
                </p>
                <p className="mb-5 text-sm text-slate-600">
                  <span className="font-semibold">Nivel:</span> {subarea.nivel}
                </p>

                {/* Botón */}
                <button
                  className={`w-full rounded-xl py-2.5 text-sm font-bold transition ${
                    iniciado
                      ? "text-white"
                      : "border border-slate-200 text-slate-700 hover:border-slate-400"
                  }`}
                  style={
                    iniciado
                      ? {
                          background: `linear-gradient(135deg, ${data.colorFrom}, ${data.colorTo})`,
                        }
                      : {}
                  }
                >
                  {iniciado ? "Continuar" : "Comenzar"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Genera rutas estáticas
export async function generateStaticParams() {
  return Object.keys(subareasData).map((area) => ({ area }));
}
