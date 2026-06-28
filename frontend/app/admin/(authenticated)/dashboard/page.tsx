"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import {
  Users,
  Target,
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

interface Usuario {
  idUsuario: number;
  correo: string;
  nombreCompleto: string;
  avatarUrl: string | null;
  rol: string; // "ADMIN" | "MENTOR" | "USER"
  activo: boolean;
  nuevoUsuario: boolean;
  fechaRegistro: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [chartRange, setChartRange] = useState<number>(7);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const [progressData, usersData] = await Promise.all([
        apiFetch<StudentProgress[]>("/api/admin/estudiantes/progreso", {}, session?.backendJwt),
        apiFetch<Usuario[]>("/api/admin/users", {}, session?.backendJwt)
      ]);
      setStudents(progressData || []);
      setUsers(usersData || []);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      setError("Error al conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // Dynamic KPIs calculations
  const totalUsuariosActivos = users.filter(u => u.activo).length;
  const discCompletados = students.filter(s =>
    s.etapaEnrolamiento === "Test DISC Completado" ||
    s.etapaEnrolamiento === "Entrevista Agendada" ||
    s.etapaEnrolamiento === "Enrolamiento Completado"
  ).length;
  const misionesFinalizadas = students.reduce((acc, curr) => acc + (curr.challengesCompletados || 0), 0);
  const certificadosValidados = students.reduce((acc, curr) => acc + (curr.skillPathsCompletados || 0), 0);

  const kpis = [
    { id: 1, label: "Total Usuarios Activos", value: totalUsuariosActivos.toLocaleString("es-ES"), icon: Users, bgClass: "bg-blue-50 text-blue-600", trend: "+12%" },
    { id: 2, label: "Test DISC Completados", value: discCompletados.toLocaleString("es-ES"), icon: Activity, bgClass: "bg-purple-50 text-purple-600", trend: "+5%" },
    { id: 3, label: "Misiones Finalizadas", value: misionesFinalizadas.toLocaleString("es-ES"), icon: Target, bgClass: "bg-rose-50 text-rose-600", trend: "+24%" },
    { id: 4, label: "Certificados Validados", value: certificadosValidados.toLocaleString("es-ES"), icon: Award, bgClass: "bg-emerald-50 text-emerald-600", trend: "+18%" },
  ];

  // Dynamic Recent Activity
  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return "Reciente";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "Hace un momento";
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Hace un momento";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} d`;
  };

  const getActionForUser = (u: Usuario) => {
    if (u.rol === "ADMIN") return "Registro de Administrador";
    if (u.rol === "MENTOR") return "Registro de Path Mentor";
    
    // For USER (student), try to get their stage
    const student = students.find(s => s.idUsuario === u.idUsuario);
    if (student) {
      if (student.etapaEnrolamiento === "Enrolamiento Completado") {
        return "Enrolamiento Completado";
      } else if (student.etapaEnrolamiento === "Entrevista Agendada") {
        return "Entrevista Agendada";
      } else if (student.etapaEnrolamiento === "Test DISC Completado") {
        return "Test DISC Completado";
      } else if (student.etapaEnrolamiento === "Perfil Confirmado") {
        return "Perfil de Estudiante Confirmado";
      } else if (student.etapaEnrolamiento === "CV Cargado") {
        return "CV Cargado con éxito";
      }
    }
    return "Registro de nuevo Estudiante";
  };

  const recentActivity = [...users]
    .sort((a, b) => {
      const dateA = a.fechaRegistro ? new Date(a.fechaRegistro).getTime() : 0;
      const dateB = b.fechaRegistro ? new Date(b.fechaRegistro).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 4)
    .map(u => ({
      id: u.idUsuario,
      action: getActionForUser(u),
      user: u.nombreCompleto,
      time: getRelativeTime(u.fechaRegistro),
      status: u.activo ? "success" : "pending"
    }));

  const finalRecentActivity = recentActivity.length > 0 ? recentActivity : [
    { id: 1, action: "Registro de nuevo Estudiante", user: "Carlos Ruiz", time: "Hace 10 min", status: "success" },
    { id: 2, action: "Test DISC finalizado", user: "Ana Martínez", time: "Hace 25 min", status: "success" },
    { id: 3, action: "Subida de certificado (Udemy)", user: "Luis Gómez", time: "Hace 1 hora", status: "pending" },
    { id: 4, action: "Entrevista completada con Mentor", user: "Sofía Castro", time: "Hace 2 horas", status: "success" },
  ];

  // Daily Registration Chart Data
  const datePoints = Array.from({ length: chartRange }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (chartRange - 1 - i));
    return d;
  });

  const chartData = datePoints.map(date => {
    const label = date.toLocaleDateString("es-ES", { 
      day: "numeric", 
      month: chartRange > 7 ? "numeric" : "short" 
    });
    const dateStr = date.toISOString().split("T")[0];
    
    const count = users.filter(u => {
      if (!u.fechaRegistro) return false;
      const regDate = u.fechaRegistro.split("T")[0];
      return regDate === dateStr;
    }).length;

    return { label, count, dateStr };
  });

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  if (status === "loading" || (loading && (students.length === 0 || users.length === 0))) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50/50 p-8">
        <RefreshCw className="h-10 w-10 animate-spin text-[#0E3E66] mb-4" />
        <p className="text-slate-600 font-semibold text-lg">Cargando métricas y análisis...</p>
        <p className="text-slate-400 text-sm mt-1">Sincronizando con el servidor en tiempo real</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
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
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 self-start rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 shadow-sm text-xs font-bold text-[#0E3E66] transition cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Sincronizar Datos</span>
        </button>
      </section>

      {/* Tarjetas de KPIs */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <article key={kpi.id} className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-4 transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${kpi.bgClass}`}>
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

      {/* Estado de Enrolamiento General */}
      <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-bold text-[#0E3E66]">Estado de enrolamiento general</h2>
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

      {/* Gráfico y Actividad Reciente */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Gráfico de Crecimiento */}
        <section className="lg:col-span-2 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm flex flex-col min-h-[320px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#0E3E66]">Crecimiento de Usuarios Registrados</h2>
              <p className="text-xs text-slate-400 mt-0.5">Nuevos registros diarios en la plataforma.</p>
            </div>
            <select 
              value={chartRange}
              onChange={(e) => setChartRange(Number(e.target.value))}
              className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none hover:border-[#0E3E66] transition cursor-pointer"
            >
              <option value={7}>Últimos 7 días</option>
              <option value={14}>Últimos 14 días</option>
            </select>
          </div>
          
          <div className="flex-1 flex flex-col justify-between mt-2">
            <div className="flex-1 flex items-stretch gap-4 relative min-h-[200px]">
              {/* Grid lines in the background */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-8">
                {[0, 1, 2, 3].map((val) => (
                  <div key={val} className="w-full border-t border-slate-100 flex justify-end">
                    <span className="text-[10px] font-bold text-slate-400 -mt-2 bg-white px-1">
                      {Math.round(maxCount - (val * (maxCount / 3)))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="flex-1 flex justify-around items-end z-10 pt-4">
                {chartData.map((data, idx) => {
                  const heightPct = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
                  return (
                    <div key={idx} className="flex flex-col items-center group relative flex-1">
                      {/* Tooltip */}
                      <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all duration-200 bg-[#0E3E66] text-white text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-md whitespace-nowrap z-30 pointer-events-none">
                        {data.count} {data.count === 1 ? 'registro' : 'registros'} ({data.label})
                        <div className="w-1.5 h-1.5 bg-[#0E3E66] rotate-45 mx-auto -mt-1.5" />
                      </div>

                      {/* Vertical Bar */}
                      <div 
                        style={{ height: `${Math.max(heightPct, 4)}%` }}
                        className={`w-7 sm:w-8 max-w-full rounded-t-lg bg-gradient-to-t ${
                          data.count > 0 
                            ? 'from-[#0E3E66] to-[#7447D7] shadow-sm shadow-indigo-100 group-hover:to-indigo-500' 
                            : 'from-slate-100 to-slate-200 group-hover:from-slate-200 group-hover:to-slate-300'
                        } transition-all duration-300 cursor-pointer`}
                      />

                      {/* Label below the bar */}
                      <span className="text-[9px] font-bold text-slate-400 mt-2 truncate w-full text-center max-w-[45px]">
                        {data.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Actividad Reciente */}
        <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0E3E66] mb-6">Actividad Reciente</h2>
          <div className="space-y-6">
            {finalRecentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="relative flex flex-col items-center">
                  <div className={`h-2.5 w-2.5 rounded-full ${activity.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'} mt-1.5 z-10 ring-4 ring-white`}></div>
                  {activity.id !== finalRecentActivity[finalRecentActivity.length - 1].id && <div className="w-px h-full bg-slate-100 absolute top-3"></div>}
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
