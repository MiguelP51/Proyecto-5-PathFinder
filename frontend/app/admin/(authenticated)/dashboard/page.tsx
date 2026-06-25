"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import {
  Users,
  Target,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Award,
  Activity,
  Calendar,
  RefreshCw,
} from "lucide-react";

interface StudentProgress {
  idUsuario: number;
  nombre: string;
  correo: string;
  rol: string;
  progresoGeneralSkillPaths: number;
  totalSkillPathsIniciados: number;
  skillPathsCompletados: number;
  totalChallenges: number;
  challengesCompletados: number;
  etapaEnrolamiento: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [students, setStudents] = useState<StudentProgress[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiFetch<StudentProgress[]>("/api/admin/estudiantes/progreso", {}, session?.backendJwt);
        setStudents(data || []);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError("Error al conectar con la base de datos.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.backendJwt) {
      fetchStats();
    }
  }, [status, session]);

  const totalEstudiantes = students.length;
  const stageCounts = {
    "Sin Iniciar": students.filter(s => s.etapaEnrolamiento === "Sin Iniciar" || !s.etapaEnrolamiento).length,
    "Carga de CV": students.filter(s => s.etapaEnrolamiento === "Carga de CV").length,
    "CV Cargado": students.filter(s => s.etapaEnrolamiento === "CV Cargado").length,
    "Perfil Confirmado": students.filter(s => s.etapaEnrolamiento === "Perfil Confirmado").length,
    "Test DISC Completado": students.filter(s => s.etapaEnrolamiento === "Test DISC Completado").length,
    "Entrevista Agendada": students.filter(s => s.etapaEnrolamiento === "Entrevista Agendada").length,
    "Enrolamiento Completado": students.filter(s => s.etapaEnrolamiento === "Enrolamiento Completado").length,
  };

  // Datos mockeados para los indicadores de uso
  const kpis = [
    { id: 1, label: "Total Usuarios Activos", value: "3,240", icon: Users, color: "blue", trend: "+12%" },
    { id: 2, label: "Test DISC Completados", value: "2,890", icon: Activity, color: "purple", trend: "+5%" },
    { id: 3, label: "Misiones Finalizadas", value: "14,562", icon: Target, color: "rose", trend: "+24%" },
    { id: 4, label: "Certificados Validados", value: "8,920", icon: Award, color: "emerald", trend: "+18%" },
  ];

  const recentActivity = [
    { id: 1, action: "Registro de nuevo Estudiante", user: "Carlos Ruiz", time: "Hace 10 min", status: "success" },
    { id: 2, action: "Test DISC finalizado", user: "Ana Martínez", time: "Hace 25 min", status: "success" },
    { id: 3, action: "Subida de certificado (Udemy)", user: "Luis Gómez", time: "Hace 1 hora", status: "pending" },
    { id: 4, action: "Entrevista completada con Mentor", user: "Sofía Castro", time: "Hace 2 horas", status: "success" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Encabezado Principal */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0E3E66] md:text-4xl">
            Análisis e Indicadores
          </h1>
          <p className="mt-2 text-slate-500 max-w-2xl text-sm md:text-base leading-relaxed">
            Monitoreo en tiempo real de la adopción y progreso de los estudiantes en la plataforma PathFinder.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-2xl bg-white border border-slate-200 px-4 py-2.5 shadow-sm text-xs font-bold text-slate-500">
          <Calendar className="h-4 w-4 text-[#0E3E66]" />
          <span>Últimos 30 días</span>
        </div>
      </section>

      {/* Tarjetas de KPIs */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <article key={kpi.id} className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-4 transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600`}>
                <kpi.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
                <TrendingUp className="h-3 w-3" />
                {kpi.trend}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">{kpi.label}</span>
              <span className="text-3xl font-black text-slate-800">{kpi.value}</span>
            </div>
          </article>
        ))}
      </section>

      {/* Funnel de Enrolamiento */}
      <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-bold text-[#0E3E66]">Funnel de Enrolamiento General</h2>
          <p className="text-xs text-slate-400 mt-1">
            Distribución actual de los {totalEstudiantes} estudiantes registrados en sus respectivas etapas del proceso de inducción.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Enrolamiento Completado",
              count: stageCounts["Enrolamiento Completado"],
              description: "Listos para aprender",
              badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
              barColor: "bg-emerald-500",
            },
            {
              title: "Entrevista Agendada",
              count: stageCounts["Entrevista Agendada"],
              description: "Simulación pendiente",
              badgeClass: "bg-sky-50 text-sky-700 border-sky-100",
              barColor: "bg-sky-500",
            },
            {
              title: "Test DISC Completado",
              count: stageCounts["Test DISC Completado"],
              description: "Pendientes de agenda",
              badgeClass: "bg-violet-50 text-violet-700 border-violet-100",
              barColor: "bg-violet-500",
            },
            {
              title: "Perfil Confirmado / CV",
              count: stageCounts["Perfil Confirmado"] + stageCounts["CV Cargado"] + stageCounts["Carga de CV"],
              description: "Fase inicial de revisión",
              badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
              barColor: "bg-amber-500",
            },
          ].map((stage, idx) => {
            const pct = totalEstudiantes > 0 ? Math.round((stage.count / totalEstudiantes) * 100) : 0;
            return (
              <article key={idx} className="rounded-2xl border border-slate-100 p-5 bg-slate-50/30 flex flex-col justify-between gap-4 transition hover:border-[#0E3E66]/20">
                <div>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold border ${stage.badgeClass}`}>
                    {stage.title}
                  </span>
                  <p className="text-3xl font-black text-slate-800 mt-3">{stage.count}</p>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">{stage.description}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Proporción</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${stage.barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Gráfico Mockeado (Espacio Visual) */}
        <section className="lg:col-span-2 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#0E3E66]">Crecimiento de Usuarios Activos</h2>
            <select className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none">
              <option>Este mes</option>
              <option>Último trimestre</option>
            </select>
          </div>
          {/* Placeholder para gráfico */}
          <div className="flex-1 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 flex items-center justify-center">
            <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Gráfico de tendencias (Espacio para Recharts o similar)
            </p>
          </div>
        </section>

        {/* Actividad Reciente */}
        <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0E3E66] mb-6">Actividad Reciente</h2>
          <div className="space-y-6">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="relative flex flex-col items-center">
                  <div className={`h-2.5 w-2.5 rounded-full ${activity.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'} mt-1.5 z-10 ring-4 ring-white`}></div>
                  {activity.id !== recentActivity.length && <div className="w-px h-full bg-slate-100 absolute top-3"></div>}
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm font-bold text-slate-700">{activity.action}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-medium text-slate-500">{activity.user}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

    </div>
  );
}

// Componente BarChart2 mock para el placeholder si no se importa globalmente
function BarChart2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
