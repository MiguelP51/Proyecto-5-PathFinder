"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
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
  const { data: session, status } = useSession();

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("Todas");
  const [selectedUser, setSelectedUser] = useState("Todos");

  const cargarLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<any[]>("/api/admin/audit-logs", {}, session?.backendJwt);
      setLogs(data || []);
    } catch (err: any) {
      console.error("Error al cargar los logs de auditoría:", err);
      setError(err instanceof Error ? err.message : "No se pudieron recuperar los logs de auditoría");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.backendJwt) {
      cargarLogs();
    }
  }, [status, session]);

  // Formato YYYY-MM-DD HH:mm:ss
  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return "";
    try {
      const d = new Date(fechaStr);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch (e) {
      return fechaStr;
    }
  };

  // Filtrado de logs en cliente
  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (log.usuarioCorreo?.toLowerCase().includes(term) || false) ||
      (log.accion?.toLowerCase().includes(term) || false) ||
      (log.modulo?.toLowerCase().includes(term) || false) ||
      (log.detalles?.toLowerCase().includes(term) || false) ||
      (log.ipOrigen?.toLowerCase().includes(term) || false);

    const matchesAction = selectedAction === "Todas" || log.accion === selectedAction;
    const matchesUser = selectedUser === "Todos" || log.usuarioCorreo === selectedUser;

    return matchesSearch && matchesAction && matchesUser;
  });

  // Catálogos dinámicos para filtros
  const uniqueUsers = Array.from(new Set(logs.map((l) => l.usuarioCorreo).filter(Boolean)));
  const uniqueActions = Array.from(new Set(logs.map((l) => l.accion).filter(Boolean)));

  // Cálculos estadísticos
  const totalAcciones = logs.length;
  const usuariosActivos = new Set(logs.map((l) => l.usuarioCorreo).filter(Boolean)).size;
  const totalExitosas = logs.filter((l) => l.resultado === "EXITO").length;
  const porcentajeExito = logs.length > 0 ? ((totalExitosas / logs.length) * 100).toFixed(1) + "%" : "100%";
  
  const erroresHoy = logs.filter((l) => {
    if (l.resultado !== "FALLO") return false;
    const dateEvent = new Date(l.fechaEvento).toDateString();
    const today = new Date().toDateString();
    return dateEvent === today;
  }).length;

  // Exportar logs a CSV
  const exportarCSV = () => {
    if (filteredLogs.length === 0) {
      alert("No hay registros filtrados para exportar.");
      return;
    }

    const headers = ["Fecha y Hora", "Usuario", "Rol", "Módulo", "Acción", "Detalles", "Resultado", "IP", "Mensaje Error"];
    const rows = filteredLogs.map((log) => [
      formatFecha(log.fechaEvento),
      log.usuarioCorreo || "",
      log.rol || "",
      log.modulo || "",
      log.accion || "",
      `"${(log.detalles || "").replace(/"/g, '""')}"`,
      log.resultado || "",
      log.ipOrigen || "",
      `"${(log.mensajeError || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(","))
    ].join("\n");

    // Incorporar UTF-8 BOM para soporte nativo de caracteres en Microsoft Excel
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bitacora_auditoria_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <button
          onClick={exportarCSV}
          className="flex items-center gap-2 self-start rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 shadow-md shadow-purple-200 transition text-sm font-bold"
        >
          <Download className="h-4 w-4" />
          <span>Exportar Logs</span>
        </button>
      </section>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Tarjetas de Estadísticas */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">
              {loading ? "..." : totalAcciones.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Acciones Registradas</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">
              {loading ? "..." : usuariosActivos}
            </span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Usuarios Activos</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">
              {loading ? "..." : porcentajeExito}
            </span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Acciones Exitosas</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">
              {loading ? "..." : erroresHoy}
            </span>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por usuario, acción o módulo..."
                className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 text-slate-700 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Acción</label>
            <div className="relative">
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 pl-4 pr-10 text-sm outline-none appearance-none cursor-pointer hover:border-purple-500 transition text-slate-700 bg-slate-50/50 font-medium"
              >
                <option value="Todas">Todas</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Usuario</label>
            <div className="relative">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 pl-4 pr-10 text-sm outline-none appearance-none cursor-pointer hover:border-purple-500 transition text-slate-700 bg-slate-50/50 font-medium"
              >
                <option value="Todos">Todos</option>
                {uniqueUsers.map((user) => (
                  <option key={user} value={user}>{user}</option>
                ))}
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
        
        {loading ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span>Cargando logs de auditoría...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-700">
              <thead className="bg-slate-50/50 border-b border-slate-200/60 font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Fecha y Hora</th>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Acción</th>
                  <th className="px-6 py-4">Módulo</th>
                  <th className="px-6 py-4">Detalles</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.idAuditoria} className="hover:bg-slate-50/40 transition">
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {formatFecha(log.fechaEvento)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">{log.usuarioCorreo}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                        log.accion?.includes('EDICION') || log.accion?.includes('UPDATE') || log.accion?.includes('CAMBIO') ? 'bg-blue-50 text-blue-600' :
                        log.accion?.includes('CREACION') || log.accion?.includes('CREATE') ? 'bg-emerald-50 text-emerald-600' :
                        log.accion?.includes('ELIMINACION') || log.accion?.includes('DELETE') ? 'bg-rose-50 text-rose-600' :
                        'bg-purple-50 text-purple-600'
                      }`}>
                        {log.accion}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">{log.modulo}</td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-[300px] truncate" title={log.detalles}>
                      {log.detalles}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        log.resultado === 'EXITO' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {log.resultado === 'EXITO' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {log.resultado === 'EXITO' ? 'Éxito' : 'Error'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">{log.ipOrigen}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No se encontraron registros de auditoría.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

