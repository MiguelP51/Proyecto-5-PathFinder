"use client";

// HU-EST-19: Dashboard general de exploración
//
// Ruta temporal de prueba: /test/exploracion-dashboard
// Ruta real (cuando auth esté lista): /user/app/exploracion/dashboard
//
// TODO pendientes cuando el backend esté listo:
//   GET /api/estudiante/exploracion/resumen
//   GET /api/estudiante/exploracion/skillpaths?estado=activo
//   GET /api/estudiante/exploracion/challenges?estado=activo
//   GET /api/estudiante/exploracion/habilidades
//   GET /api/estudiante/exploracion/insignias?recientes=true
//   GET /api/estudiante/exploracion/notificaciones
//   GET /api/estudiante/exploracion/siguiente-accion
//   GET /api/estudiante/exploracion/entrevistas-proximas

import Footer from "@/components/Footer";
import {
  TrendingUp,
  Award,
  BookOpen,
  Target,
  Bell,
  Users,
  ArrowRight,
  Search,
  Calendar,
} from "lucide-react";

// ─── Datos mock ───────────────────────────────────────────────────────────────

const usuario = {
  nombre: "María González",
  email: "maria.gonzalez@example.com",
  nivel: 5,
  xpActual: 2450,
  xpSiguienteNivel: 3000,
};

const metricas = [
  {
    valor: "2450 XP",
    label: "Experiencia total",
    badge: "Nivel 5",
    icon: TrendingUp,
    iconColor: "text-[#7447D7]",
    badgeColor: "bg-[#7447D7] text-white",
  },
  {
    valor: "2",
    label: "Insignias obtenidas",
    badge: null,
    icon: Award,
    iconColor: "text-yellow-500",
    badgeColor: "",
  },
  {
    valor: "2",
    label: "SkillPaths activos",
    badge: null,
    icon: BookOpen,
    iconColor: "text-[#7447D7]",
    badgeColor: "",
  },
  {
    valor: "1",
    label: "Challenges en progreso",
    badge: null,
    icon: Target,
    iconColor: "text-emerald-500",
    badgeColor: "",
  },
];

const siguienteAccion = {
  titulo: "Continúa tu Scrum Master Professional Certificate",
  descripcion: "Llevas un 60% de progreso. ¡Solo te quedan 2 semanas!",
};

const skillPaths = [
  {
    id: 1,
    titulo: "Scrum Master Professional Certificate",
    plataforma: "Coursera",
    progreso: 60,
    estado: "En progreso",
    estadoColor: "bg-purple-100 text-[#7447D7]",
  },
  {
    id: 2,
    titulo: "Effective Communication Skills",
    plataforma: "LinkedIn Learning",
    progreso: 30,
    estado: "Certificado pendiente",
    estadoColor: "bg-orange-100 text-orange-600",
  },
];

const challenges = [
  {
    id: 1,
    titulo: "Sprint Planning Challenge",
    descripcion:
      "Planifica un sprint completo para un proyecto de desarrollo de software",
    dificultad: "Medio",
    dificultadColor: "bg-yellow-100 text-yellow-700",
    duracion: "2 horas",
    xp: 350,
    progreso: 45,
  },
];

const habilidades = [
  { nombre: "Gestión de Proyectos", nivel: 3, progreso: 3, total: 5 },
  { nombre: "Análisis de Datos", nivel: 2, progreso: 2, total: 5 },
  { nombre: "Comunicación Efectiva", nivel: 4, progreso: 4, total: 5 },
  { nombre: "Metodologías Ágiles", nivel: 2, progreso: 2, total: 5 },
];

const insignias = [
  {
    id: 1,
    nombre: "Primera Victoria",
    descripcion: "Completa tu primer PathChallenge",
    fecha: "9/2/2026",
    emoji: "🏆",
    bg: "bg-yellow-100",
  },
  {
    id: 2,
    nombre: "Explorador",
    descripcion: "Completa diagnósticos en 3 subáreas diferentes",
    fecha: "14/3/2026",
    emoji: "🔵",
    bg: "bg-blue-100",
  },
];

const notificaciones = [
  {
    id: 1,
    titulo: "Entrevista agendada",
    descripcion:
      "Tu entrevista con Carlos Rodríguez está programada para el 5 de junio a las 15:00",
  },
  {
    id: 2,
    titulo: "Feedback disponible",
    descripcion:
      "Carlos Rodríguez dejó comentarios sobre tu entrevista. Revisa tus áreas de mejora.",
  },
  {
    id: 3,
    titulo: "SkillPath completado",
    descripcion:
      'Has completado "Fundamentos de Excel". Sube tu certificado para validarlo.',
  },
];

const entrevistasProximas = [
  {
    id: 1,
    nombre: "Carlos Rodríguez",
    cargo: "Senior Project Manager",
    fecha: "4/6/2026 - 15:00",
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ExploracionDashboardPage() {
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
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#7447D7]">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{siguienteAccion.titulo}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {siguienteAccion.descripcion}
                    </p>
                    <button className="mt-3 inline-flex h-9 items-center rounded-lg bg-[#7447D7] px-4 text-sm font-bold text-white hover:bg-[#6338c4]">
                      Continuar aprendiendo
                    </button>
                  </div>
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
                  <button className="text-sm font-semibold text-[#7447D7] hover:underline">
                    Ver todos
                  </button>
                </div>
                <div className="space-y-4">
                  {skillPaths.map((sp) => (
                    <div
                      key={sp.id}
                      className="rounded-xl border border-slate-100 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{sp.titulo}</p>
                          <p className="text-xs text-slate-500">
                            {sp.plataforma}
                          </p>
                        </div>
                        <span
                          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${sp.estadoColor}`}
                        >
                          {sp.estado}
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-xs text-slate-500">
                          <span>Progreso</span>
                          <span>{sp.progreso}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-[#7447D7] to-[#D43EE6]"
                            style={{ width: `${sp.progreso}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
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
                  <button className="text-sm font-semibold text-[#7447D7] hover:underline">
                    Ver todos
                  </button>
                </div>
                <div className="space-y-4">
                  {challenges.map((ch) => (
                    <div
                      key={ch.id}
                      className="rounded-xl border border-slate-100 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold">{ch.titulo}</p>
                        <span
                          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${ch.dificultadColor}`}
                        >
                          {ch.dificultad}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {ch.descripcion}
                      </p>
                      <div className="mt-2 flex gap-4 text-xs text-slate-500">
                        <span>⏱ {ch.duracion}</span>
                        <span>⭐ {ch.xp} XP</span>
                      </div>
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-xs text-slate-500">
                          <span>Progreso</span>
                          <span>{ch.progreso}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{ width: `${ch.progreso}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
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
                <button className="flex-shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:border-[#7447D7] hover:text-[#7447D7]">
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
                    {usuario.xpActual} / {usuario.xpSiguienteNivel} XP
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-[#7447D7] to-[#D43EE6]"
                    style={{
                      width: `${(usuario.xpActual / usuario.xpSiguienteNivel) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Tus Habilidades — cuadro propio */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-extrabold">Tus Habilidades</h2>
                <div className="space-y-3">
                  {habilidades.map((h) => (
                    <div key={h.nombre}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{h.nombre}</span>
                        <span className="text-xs font-semibold text-[#7447D7]">
                          Nivel {h.nivel}{" "}
                          <span className="text-slate-400">
                            {h.progreso}/{h.total}
                          </span>
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                        <div
                          className="h-1.5 rounded-full bg-[#7447D7]"
                          style={{ width: `${(h.progreso / h.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Próximas Entrevistas — cuadro propio */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-extrabold">
                  <Calendar className="mr-2 inline h-4 w-4 text-[#7447D7]" />
                  Próximas Entrevistas
                </h2>
                <div className="space-y-3">
                  {entrevistasProximas.map((e) => (
                    <div
                      key={e.id}
                      className="rounded-xl border border-slate-100 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#7447D7]" />
                        <p className="font-semibold">{e.nombre}</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{e.cargo}</p>
                      <p className="text-xs text-slate-500">{e.fecha}</p>
                    </div>
                  ))}
                </div>
                <button className="mt-3 w-full rounded-xl border border-slate-200 py-2 text-sm font-semibold transition hover:border-[#7447D7] hover:text-[#7447D7]">
                  Ver todas
                </button>
              </div>

              {/* Insignias recientes — cuadro propio */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-extrabold">Insignias Recientes</h2>
                <div className="grid grid-cols-2 gap-3">
                  {insignias.map((ins) => (
                    <div
                      key={ins.id}
                      className="flex flex-col items-center rounded-xl border border-slate-100 p-3 text-center"
                    >
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${ins.bg}`}
                      >
                        {ins.emoji}
                      </div>
                      <p className="mt-2 text-xs font-bold">{ins.nombre}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {ins.descripcion}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold text-emerald-600">
                        ✓ Obtenida {ins.fecha}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notificaciones — cuadro propio */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-extrabold">
                  <Bell className="mr-2 inline h-4 w-4" />
                  Notificaciones
                </h2>
                <div className="space-y-3">
                  {notificaciones.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                    >
                      <p className="text-sm font-bold">{n.titulo}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {n.descripcion}
                      </p>
                    </div>
                  ))}
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
