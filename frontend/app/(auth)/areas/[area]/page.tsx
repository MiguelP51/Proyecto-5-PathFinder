// HU-EST-20: Explorar área específica
// Ruta: /areas/[area]
// Accesible desde el botón "Explorar área" en /areas
// Muestra: hero del área + funciones específicas + subáreas (Especializa tu carrera)

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Footer from "@/components/Footer";

// ─── Datos de las áreas ───────────────────────────────────────────────────────
const areasData = {
  "recursos-humanos": {
    title: "Recursos Humanos",
    emoji: "👥",
    badge: "Recursos Humanos",
    colorFrom: "#6f63ff",
    colorTo: "#8f4df0",
    tagline:
      "Aprende a gestionar el talento humano y desarrollar estrategias de reclutamiento y selección",
    description:
      "Esta área se enfoca en desarrollar profesionales capaces de gestionar el recurso más valioso de cualquier organización: las personas. Aprenderás a diseñar estrategias de atracción, desarrollo y retención de talento, así como a crear ambientes laborales productivos y saludables.",
    image: "/areas/rrhh.jpg",
    funciones: [
      "Gestión estratégica de talento humano",
      "Administración de compensaciones",
      "Cumplimiento normativo",
      "Desarrollo organizacional",
      "Clima y cultura laboral",
    ],
    subareas: [
      {
        emoji: "🎯",
        nombre: "Reclutamiento y Selección",
        descripcion: "Procesos de atracción y selección de talento",
      },
      {
        emoji: "📊",
        nombre: "Gestión del Desempeño",
        descripcion: "Evaluación y desarrollo de colaboradores",
      },
      {
        emoji: "✨",
        nombre: "Clima Organizacional",
        descripcion: "Cultura y ambiente laboral",
      },
    ],
  },
  marketing: {
    title: "Marketing",
    emoji: "📱",
    badge: "Marketing",
    colorFrom: "#ba42dc",
    colorTo: "#ef4bc8",
    tagline:
      "Domina estrategias de marketing digital y tradicional para impulsar marcas",
    description:
      "Esta área se enfoca en desarrollar profesionales capaces de gestionar el recurso más valioso de cualquier organización: las personas. Aprenderás a diseñar estrategias de atracción, desarrollo y retención de talento, así como a crear ambientes laborales productivos y saludables.",
    image: "/areas/marketing.jpg",
    funciones: [
      "Gestión estratégica de talento humano",
      "Administración de compensaciones",
      "Cumplimiento normativo",
      "Desarrollo organizacional",
      "Clima y cultura laboral",
    ],
    subareas: [
      {
        emoji: "💻",
        nombre: "Marketing Digital",
        descripcion: "SEO, SEM y estrategias digitales",
      },
      {
        emoji: "📱",
        nombre: "Social Media",
        descripcion: "Gestión de redes sociales",
      },
      {
        emoji: "🎨",
        nombre: "Branding",
        descripcion: "Construcción y gestión de marca",
      },
    ],
  },
  finanzas: {
    title: "Finanzas",
    emoji: "💰",
    badge: "Finanzas",
    colorFrom: "#f73586",
    colorTo: "#f2186c",
    tagline:
      "Desarrolla habilidades en análisis financiero y gestión de inversiones",
    description:
      "Esta área se enfoca en desarrollar profesionales capaces de gestionar el recurso más valioso de cualquier organización: las personas. Aprenderás a diseñar estrategias de atracción, desarrollo y retención de talento, así como a crear ambientes laborales productivos y saludables.",
    image: "/areas/finanzas.jpg",
    funciones: [
      "Gestión estratégica de talento humano",
      "Administración de compensaciones",
      "Cumplimiento normativo",
      "Desarrollo organizacional",
      "Clima y cultura laboral",
    ],
    subareas: [
      {
        emoji: "📈",
        nombre: "Análisis Financiero",
        descripcion: "Evaluación de estados financieros",
      },
      {
        emoji: "💹",
        nombre: "Gestión de Inversiones",
        descripcion: "Portafolios y estrategias de inversión",
      },
    ],
  },
  comercial: {
    title: "Comercial",
    emoji: "🤝",
    badge: "Comercial",
    colorFrom: "#ff3f6e",
    colorTo: "#ff4438",
    tagline:
      "Aprende técnicas de ventas y negociación para impulsar resultados comerciales",
    description:
      "Esta área se enfoca en desarrollar profesionales capaces de gestionar el recurso más valioso de cualquier organización: las personas. Aprenderás a diseñar estrategias de atracción, desarrollo y retención de talento, así como a crear ambientes laborales productivos y saludables.",
    image: "/areas/comercial.jpg",
    funciones: [
      "Gestión estratégica de talento humano",
      "Administración de compensaciones",
      "Cumplimiento normativo",
      "Desarrollo organizacional",
      "Clima y cultura laboral",
    ],
    subareas: [
      {
        emoji: "💼",
        nombre: "Técnicas de Ventas",
        descripcion: "Estrategias de venta efectivas",
      },
      {
        emoji: "🤝",
        nombre: "Negociación",
        descripcion: "Habilidades de negociación comercial",
      },
    ],
  },
  logistica: {
    title: "Logística",
    emoji: "📦",
    badge: "Logística",
    colorFrom: "#ff6a00",
    colorTo: "#f7931e",
    tagline: "Optimiza cadenas de suministro y gestiona operaciones logísticas",
    description:
      "Esta área se enfoca en desarrollar profesionales capaces de gestionar el recurso más valioso de cualquier organización: las personas. Aprenderás a diseñar estrategias de atracción, desarrollo y retención de talento, así como a crear ambientes laborales productivos y saludables.",
    image: "/areas/logistica.jpg",
    funciones: [
      "Gestión estratégica de talento humano",
      "Administración de compensaciones",
      "Cumplimiento normativo",
      "Desarrollo organizacional",
      "Clima y cultura laboral",
    ],
    subareas: [
      {
        emoji: "🔗",
        nombre: "Cadena de Suministro",
        descripcion: "Gestión de supply chain",
      },
      {
        emoji: "📊",
        nombre: "Gestión de Inventarios",
        descripcion: "Control y optimización de inventarios",
      },
    ],
  },
};

// ─── Página ───────────────────────────────────────────────────────────────────
export default async function AreaDetailPage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area: areaSlug } = await params;
  const area = areasData[areaSlug as keyof typeof areasData];

  if (!area) notFound();

  // Divide funciones en dos columnas
  const mitad = Math.ceil(area.funciones.length / 2);
  const col1 = area.funciones.slice(0, mitad);
  const col2 = area.funciones.slice(mitad);

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
                background: `linear-gradient(135deg, ${area.colorFrom}, ${area.colorTo})`,
              }}
            >
              {area.badge}
            </span>

            {/* Ícono + Título */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{area.emoji}</span>
              <h1 className="text-4xl font-black text-slate-900 md:text-5xl">
                {area.title}
              </h1>
            </div>

            {/* Tagline */}
            <p className="mb-4 text-lg font-semibold text-slate-700 leading-snug">
              {area.tagline}
            </p>

            {/* Descripción */}
            <p className="mb-8 text-slate-500 leading-relaxed">
              {area.description}
            </p>

            {/* Botón */}
            <a
              href={`/areas/${areaSlug}/subareas`}
              className="inline-flex items-center rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${area.colorFrom}, ${area.colorTo})`,
              }}
            >
              Explorar subáreas
            </a>
          </div>

          {/* Imagen */}
          <div>
            <img
              src={area.image}
              alt={area.title}
              className="w-full h-80 rounded-2xl object-cover shadow-xl lg:h-96"
            />
          </div>
        </div>
      </section>

      {/* ── Funciones específicas ── */}
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
                  style={{ color: area.colorFrom }}
                />
                <span className="text-sm text-slate-700">{funcion}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Especializa tu carrera ── */}
      <section id="subareas" className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="mb-2 text-2xl font-black text-slate-900">
          Especializa tu carrera
        </h2>
        <p className="mb-8 text-slate-500">
          Explora las {area.subareas.length} subáreas especializadas de{" "}
          {area.title} y comienza tu desarrollo profesional.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {area.subareas.map((subarea) => (
            <div
              key={subarea.nombre}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
            >
              <span className="mb-4 block text-3xl">{subarea.emoji}</span>
              <h3 className="mb-1 font-bold text-slate-900">
                {subarea.nombre}
              </h3>
              <p className="text-sm text-slate-500">{subarea.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Genera las rutas estáticas para las 5 áreas
export function generateStaticParams() {
  return Object.keys(areasData).map((area) => ({ area }));
}
