"use client";

import {
  FileText,
  Users,
  CheckCircle,
  AlertOctagon,
  Search,
  ShieldCheck,
  Download,
  CheckCircle2,
  XCircle,
  ChevronDown
} from "lucide-react";

export default function AuditLogsPage() {
  // Datos hardcodeados basados en el PDF
  const logs = [
    {
      id: 1,
      fechaHora: "2026-06-01 14:23:45",
      usuario: "admin@pathfinder.com",
      accion: "UPDATE",
      recurso: "User",
      detalles: "Cambió rol de usuario ID 1247 de Student a PathMentor",
      estado: "Éxito",
      ip: "192.168.1.100"
    },
    {
      id: 2,
      fechaHora: "2026-06-01 13:15:22",
      usuario: "admin@pathfinder.com",
      accion: "CREATE",
      recurso: "PsychometricQuestion",
      detalles: "Creó nueva pregunta DISC: \"¿Cómo prefieres trabajar?\"",
      estado: "Éxito",
      ip: "192.168.1.100"
    },
    {
      id: 3,
      fechaHora: "2026-06-01 12:47:10",
      usuario: "moderator@pathfinder.com",
      accion: "APPROVE",
      recurso: "CommunityMission",
      detalles: "Aprobó misión \"Crear landing page con React\"",
      estado: "Éxito",
      ip: "192.168.1.105"
    },
    {
      id: 4,
      fechaHora: "2026-06-01 11:32:18",
      usuario: "admin@pathfinder.com",
      accion: "DELETE",
      recurso: "SkillPath",
      detalles: "Intentó eliminar SkillPath ID 45",
      estado: "Error",
      ip: "192.168.1.100"
    },
    {
      id: 5,
      fechaHora: "2026-06-01 10:05:33",
      usuario: "admin@pathfinder.com",
      accion: "UPDATE",
      recurso: "Area",
      detalles: "Actualizó descripción del área \"Tecnología\"",
      estado: "Éxito",
      ip: "192.168.1.100"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Encabezado Principal */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0E3E66] md:text-4xl">
            Auditoría y Logs
          </h1>
          <p className="mt-2 text-slate-500 max-w-2xl text-sm md:text-base leading-relaxed">
            Registro de acciones y cambios en la plataforma
          </p>
        </div>
        <button className="flex items-center gap-2 self-start rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 shadow-md shadow-purple-200 transition text-sm font-bold">
          <Download className="h-4 w-4" />
          <span>Exportar Logs</span>
        </button>
      </section>

      {/* Tarjetas de Estadísticas */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">8,742</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Acciones Registradas</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">12</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Usuarios Activos</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">99.2%</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Acciones Exitosas</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">3</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Errores (Hoy)</span>
          </div>
        </article>
      </section>

      {/* Integración SSO Corporativo */}
      <section className="bg-white rounded-3xl border border-blue-100 p-6 shadow-sm shadow-blue-50">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#0E3E66]">Integración SSO Corporativo</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              El sistema está configurado para autenticación centralizada mediante Google Workspace. Todos los administradores deben iniciar sesión con sus cuentas corporativas.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-slate-500 font-medium">Proveedor:</span>
                <span className="text-slate-700 font-bold">Google Workspace</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-slate-500 font-medium">Estado:</span>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">Activo</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-slate-500 font-medium">Usuarios Autorizados:</span>
                <span className="text-slate-700 font-bold">12</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-slate-500 font-medium">2FA Requerido:</span>
                <span className="text-slate-700 font-bold">Sí</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Buscar y Filtrar Logs */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800 mb-2">Buscar y Filtrar</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Q Buscar por usuario, acción o recurso..."
                className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 text-slate-700 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Acción</label>
            <div className="relative">
              <select className="w-full h-11 rounded-xl border border-slate-200 pl-4 pr-10 text-sm outline-none appearance-none cursor-pointer hover:border-purple-500 transition text-slate-700 bg-slate-50/50 font-medium">
                <option>Todas</option>
                <option>CREATE</option>
                <option>UPDATE</option>
                <option>DELETE</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Usuario</label>
            <div className="relative">
              <select className="w-full h-11 rounded-xl border border-slate-200 pl-4 pr-10 text-sm outline-none appearance-none cursor-pointer hover:border-purple-500 transition text-slate-700 bg-slate-50/50 font-medium">
                <option>Todos</option>
                <option>admin@pathfinder.com</option>
                <option>moderator@pathfinder.com</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Tabla Registro de Actividad */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col gap-1">
          <h2 className="text-base font-bold text-slate-800">Registro de Actividad</h2>
          <p className="text-xs text-slate-500">Historial completo de acciones realizadas por administradores</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50/50 border-b border-slate-200/60 font-bold text-slate-500 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Acción</th>
                <th className="px-6 py-4">Recurso</th>
                <th className="px-6 py-4">Detalles</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/40 transition">
                  <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">{log.fechaHora}</td>
                  <td className="px-6 py-4 text-slate-600 text-xs">{log.usuario}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                      log.accion === 'UPDATE' ? 'bg-blue-50 text-blue-600' :
                      log.accion === 'CREATE' ? 'bg-emerald-50 text-emerald-600' :
                      log.accion === 'DELETE' ? 'bg-rose-50 text-rose-600' :
                      'bg-purple-50 text-purple-600'
                    }`}>
                      {log.accion}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">{log.recurso}</td>
                  <td className="px-6 py-4 text-xs text-slate-600 max-w-[300px] truncate" title={log.detalles}>
                    {log.detalles}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                      log.estado === 'Éxito' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {log.estado === 'Éxito' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      {log.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
