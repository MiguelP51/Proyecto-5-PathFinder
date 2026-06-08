"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  Target,
  Star,
  Award,
  TrendingUp,
  Users,
  ChevronRight,
} from "lucide-react";

// ─── Datos de las 6 slides (según diseño) ─────────────────────────────────────
const slides = [
  {
    icon: BookOpen,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    illustrationBg: "from-blue-50 to-purple-100",
    illustrationColor: "text-blue-200",
    title: "SkillPath: Tu ruta de aprendizaje",
    description:
      "Los SkillPaths son rutas curadas que te guían hacia cursos externos de plataformas reconocidas como Coursera, LinkedIn Learning y Udemy.",
    bullets: [
      "Cursos organizados por habilidad y nivel",
      "Completa en plataformas externas",
      "Sube tu certificado al finalizar",
      "Gana XP y desbloquea habilidades",
    ],
  },
  {
    icon: Target,
    iconBg: "bg-purple-100",
    iconColor: "text-[#7447D7]",
    illustrationBg: "from-purple-50 to-purple-100",
    illustrationColor: "text-purple-200",
    title: "PathChallenge: Retos prácticos",
    description:
      "Los PathChallenges son retos prácticos dentro de PathFinder donde aplicas tus conocimientos en casos simulados del mundo real.",
    bullets: [
      "Casos de negocio reales",
      "Toma decisiones estratégicas",
      "Entrega proyectos y recibe feedback",
      "Diferentes niveles de dificultad",
    ],
  },
  {
    icon: Star,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-500",
    illustrationBg: "from-yellow-50 to-purple-100",
    illustrationColor: "text-yellow-200",
    title: "Sistema de XP y Niveles",
    description:
      "Gana experiencia (XP) al completar SkillPaths, PathChallenges y diagnósticos. Sube de nivel y desbloquea nuevas oportunidades.",
    bullets: [
      "Cada actividad otorga XP",
      "Sube de nivel progresivamente",
      "Desbloquea contenido avanzado",
      "Visualiza tu progreso en tiempo real",
    ],
  },
  {
    icon: Award,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    illustrationBg: "from-orange-50 to-purple-100",
    illustrationColor: "text-orange-200",
    title: "Insignias y Logros",
    description:
      "Colecciona insignias al alcanzar hitos importantes. Cada insignia representa un logro significativo en tu desarrollo profesional.",
    bullets: [
      "Insignias únicas por logro",
      "Diferentes niveles de rareza",
      "Muestra tu progreso al mundo",
      "Desbloquea beneficios especiales",
    ],
  },
  {
    icon: TrendingUp,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-500",
    illustrationBg: "from-emerald-50 to-purple-100",
    illustrationColor: "text-emerald-300",
    title: "Habilidades y Progreso",
    description:
      "Desarrolla y mejora habilidades específicas. Cada habilidad tiene niveles que aumentan según completes actividades relacionadas.",
    bullets: [
      "Seguimiento de habilidades individuales",
      "Niveles del 1 al 5",
      "Recomendaciones personalizadas",
      "Dashboard visual de progreso",
    ],
  },
  {
    icon: Users,
    iconBg: "bg-indigo-100",
    iconColor: "text-[#7447D7]",
    illustrationBg: "from-indigo-50 to-purple-100",
    illustrationColor: "text-indigo-200",
    title: "PathMentors: Entrevistas",
    description:
      "Agenda entrevistas virtuales o presenciales con profesionales experimentados para recibir orientación y feedback.",
    bullets: [
      "Agenda con un solo clic",
      "Integración con Google Calendar",
      "Feedback detallado post-entrevista",
      "Historial completo de entrevistas",
    ],
  },
];

// ─── Componente principal ──────────────────────────────────────────────────────
export default function ExploracionIntroPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  const isLast = current === slides.length - 1;
  const slide = slides[current];
  const Icon = slide.icon;

  const goTo = (index: number) => setCurrent(index);

  const handleNext = () => {
    if (isLast) {
      // TODO: POST /api/estudiante/exploracion/iniciar
      router.push("/user/app/exploracion/dashboard");
    } else {
      setCurrent((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    // TODO: POST /api/estudiante/exploracion/iniciar
    router.push("/user/app/exploracion/dashboard");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#eef3fb] via-white to-[#f0eeff] px-4 py-10 text-[#081333]">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
        {/* ── Dots de navegación ── */}
        <div className="mb-8 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir a slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-10 bg-[#7447D7]"
                  : "w-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>

        {/* ── Tarjeta ── */}
        <Card className="w-full max-w-3xl border-slate-200 bg-white p-8 shadow-md md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            {/* Lado izquierdo: contenido */}
            <div className="flex-1">
              {/* Ícono */}
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${slide.iconBg}`}
              >
                <Icon className={`h-7 w-7 ${slide.iconColor}`} />
              </div>

              {/* Título */}
              <h1 className="text-2xl font-extrabold leading-snug md:text-3xl">
                {slide.title}
              </h1>

              {/* Descripción */}
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {slide.description}
              </p>

              {/* Bullets */}
              <ul className="mt-5 space-y-2.5">
                {slide.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-center gap-3 text-sm text-slate-700"
                  >
                    {/* Ícono check verde circular */}
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-emerald-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            {/* Lado derecho: ilustración */}
            <div
              className={`flex h-52 w-full flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${slide.illustrationBg} md:h-60 md:w-60`}
            >
              <Icon
                className={`h-32 w-32 ${slide.illustrationColor}`}
                strokeWidth={1}
              />
            </div>
          </div>
        </Card>

        {/* ── Footer: saltar / contador / siguiente ── */}
        <div className="mt-6 flex w-full max-w-3xl items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="px-0 text-sm font-medium text-slate-500 hover:bg-transparent hover:text-[#7447D7]"
          >
            Saltar tutorial
          </Button>

          <span className="text-sm text-slate-400">
            {current + 1} de {slides.length}
          </span>

          <Button
            type="button"
            onClick={handleNext}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#7447D7] px-6 text-sm font-bold text-white transition hover:bg-[#6338c4]"
          >
            {isLast ? "Comenzar" : "Siguiente"}
            {!isLast && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* ── Nota inferior ── */}
        <p className="mt-4 text-center text-xs text-slate-400">
          Puedes volver a ver este tutorial en cualquier momento desde el ícono
          de ayuda (?) en el header
        </p>
      </div>
    </main>
  );
}
