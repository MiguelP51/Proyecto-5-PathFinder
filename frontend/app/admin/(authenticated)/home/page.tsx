"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import {
  Search,
  Users,
  Shield,
  User,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Calendar,
  AlertTriangle,
  UserCheck,
  ChevronDown,
  Download,
} from "lucide-react";

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

interface StudentProgress {
  idUsuario: number;
  nombre: string;
  correo: string;
  rol: string;
  progresoGeneralSkillPaths: number;
  totalSkillPathsIniciados: number;
  skillPathsCompletados: number;
  skillPathsEnProgreso: number;
  totalChallenges: number;
  challengesCompletados: number;
  etapaEnrolamiento: string;
}

export default function UsuariosPage() {
  const { data: session, status } = useSession();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [etapaFilter, setEtapaFilter] = useState<string>("ALL");

  // Estados del Modal de Confirmación
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [targetRole, setTargetRole] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [updateError, setUpdateError] = useState("");

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError("");
      const [usersData, progressData] = await Promise.all([
        apiFetch<Usuario[]>("/api/admin/users", {}, session?.backendJwt),
        apiFetch<StudentProgress[]>("/api/admin/estudiantes/progreso", {}, session?.backendJwt).catch((err) => {
          console.error("Error al cargar progreso de estudiantes:", err);
          return [] as StudentProgress[];
        }),
      ]);
      setUsuarios(usersData);
      setStudentProgress(progressData);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron recuperar los usuarios del sistema."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.backendJwt) {
      cargarUsuarios();
    }
  }, [status, session]);

  const handleRoleChangeInitiate = (user: Usuario, newRole: string) => {
    if (user.rol === newRole) return;
    setSelectedUser(user);
    setTargetRole(newRole);
    setShowConfirmModal(true);
    setUpdateError("");
  };

  const handleRoleChangeConfirm = async () => {
    if (!selectedUser || !targetRole) return;
    try {
      setUpdating(true);
      setUpdateError("");

      const updatedUser = await apiFetch<Usuario>(
        `/api/admin/users/${selectedUser.idUsuario}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rol: targetRole }),
        },
        session?.backendJwt
      );

      // Actualizar el estado local
      setUsuarios((prev) =>
        prev.map((u) => (u.idUsuario === updatedUser.idUsuario ? updatedUser : u))
      );

      setSuccessMessage(
        `¡Rol de ${selectedUser.nombreCompleto} actualizado a ${getRoleDisplayName(targetRole)} con éxito!`
      );
      setTimeout(() => setSuccessMessage(""), 5000);
      setShowConfirmModal(false);
      setSelectedUser(null);
      setTargetRole("");
    } catch (err) {
      console.error("Error al actualizar rol:", err);
      setUpdateError(
        err instanceof Error
          ? err.message
          : "No se pudo completar la actualización de rol."
      );
    } finally {
      setUpdating(false);
    }
  };

  // Filtrado de usuarios en cliente
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchesSearch =
      usuario.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.correo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "ALL" || usuario.rol === roleFilter;

    if (!matchesSearch || !matchesRole) return false;

    if (roleFilter === "USER" && etapaFilter !== "ALL") {
      const progress = studentProgress.find((p) => p.idUsuario === usuario.idUsuario);
      const etapa = progress?.etapaEnrolamiento || "Sin Iniciar";
      return etapa === etapaFilter;
    }

    return true;
  });

  const exportarCSV = () => {
    const headers = [
      "Nombre",
      "Correo",
      "Etapa de Enrolamiento",
      "SkillPaths Iniciados",
      "SkillPaths Completados",
      "Progreso SkillPaths (%)",
      "Challenges Completados",
      "Total Challenges"
    ];

    const rows = usuariosFiltrados.map((usuario) => {
      const progress = studentProgress.find((p) => p.idUsuario === usuario.idUsuario);
      return [
        usuario.nombreCompleto || "",
        usuario.correo || "",
        progress?.etapaEnrolamiento || "Sin Iniciar",
        progress?.totalSkillPathsIniciados ?? 0,
        progress?.skillPathsCompletados ?? 0,
        progress?.progresoGeneralSkillPaths ?? 0,
        progress?.challengesCompletados ?? 0,
        progress?.totalChallenges ?? 0
      ];
    });

    const csvRows = [headers.join(",")];
    for (const row of rows) {
      csvRows.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","));
    }
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `estudiantes_progreso_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Métricas rápidas
  const totalUsuarios = usuarios.length;
  const totalAdmins = usuarios.filter((u) => u.rol === "ADMIN").length;
  const totalMentors = usuarios.filter((u) => u.rol === "MENTOR").length;
  const totalEstudiantes = usuarios.filter((u) => u.rol === "USER").length;

  function getRoleDisplayName(rol?: string): string {
    switch (rol?.toUpperCase()) {
      case "ADMIN":
        return "Administrador";
      case "MENTOR":
        return "Path Mentor";
      case "USER":
        return "Estudiante";
      default:
        return "Usuario";
    }
  }

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }

  if (status === "loading" || (loading && usuarios.length === 0)) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50/50 p-8">
        <RefreshCw className="h-10 w-10 animate-spin text-[#0E3E66] mb-4" />
        <p className="text-slate-600 font-semibold text-lg">Cargando base de usuarios...</p>
        <p className="text-slate-400 text-sm mt-1">Conectando de forma segura con el servidor</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Encabezado Principal */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0E3E66] md:text-4xl">
            Gestión de Usuarios
          </h1>
          <p className="mt-2 text-slate-500 max-w-2xl text-sm md:text-base leading-relaxed">
            Consulte la lista completa de personas inscritas a través de Google y asigne los accesos de administradores y Path Mentors del sistema.
          </p>
        </div>

      </section>

      {/* Alertas de Notificación de Éxito */}
      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-emerald-800">{successMessage}</p>
        </div>
      )}

      {/* Alertas de Notificación de Error General */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-rose-800">No se pudo cargar la información</p>
            <p className="text-xs text-rose-600 mt-0.5">{error}</p>
          </div>
          <button
            onClick={cargarUsuarios}
            className="ml-auto text-xs font-bold bg-white border border-rose-200 hover:border-rose-300 text-rose-700 px-3 py-1.5 rounded-lg transition"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tarjetas de Estadísticas */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex items-center gap-4 transition hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Usuarios</span>
            <span className="text-2xl font-black text-slate-800">{totalUsuarios}</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex items-center gap-4 transition hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Administradores</span>
            <span className="text-2xl font-black text-slate-800">{totalAdmins}</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex items-center gap-4 transition hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Path Mentors</span>
            <span className="text-2xl font-black text-slate-800">{totalMentors}</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex items-center gap-4 transition hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
            <User className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Estudiantes</span>
            <span className="text-2xl font-black text-slate-800">{totalEstudiantes}</span>
          </div>
        </article>
      </section>

      {/* Controles de Búsqueda y Filtrado */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Barra de Búsqueda */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo electrónico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 rounded-2xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition focus:border-[#0E3E66] focus:ring-2 focus:ring-[#0E3E66]/10 text-slate-700 bg-slate-50/30"
          />
        </div>

        {/* Pestañas de Filtros de Rol y Controles de Estudiante */}
        <div className="flex flex-wrap items-center gap-3">
          {roleFilter === "USER" && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Dropdown Filtro Etapa */}
              <div className="relative inline-block w-48">
                <select
                  value={etapaFilter}
                  onChange={(e) => setEtapaFilter(e.target.value)}
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 pl-3.5 pr-8 text-xs font-bold text-slate-600 outline-none appearance-none cursor-pointer hover:border-[#0E3E66] transition"
                >
                  <option value="ALL">Todas las Etapas</option>
                  <option value="Sin Iniciar">Sin Iniciar</option>
                  <option value="Carga de CV">Carga de CV</option>
                  <option value="CV Cargado">CV Cargado</option>
                  <option value="Perfil Confirmado">Perfil Confirmado</option>
                  <option value="Test DISC Completado">Test DISC Completado</option>
                  <option value="Entrevista Agendada">Entrevista Agendada</option>
                  <option value="Enrolamiento Completado">Enrolamiento Completado</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>

              {/* Botón Descargar CSV */}
              <button
                onClick={exportarCSV}
                className="h-11 px-4 rounded-2xl bg-[#0E3E66] hover:bg-[#0E3E66]/90 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Exportar CSV</span>
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-1 bg-slate-100/80 rounded-2xl p-1 shrink-0">
            {[
              { id: "ALL", label: "Todos" },
              { id: "ADMIN", label: "Administradores" },
              { id: "MENTOR", label: "Path Mentors" },
              { id: "USER", label: "Estudiantes" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setRoleFilter(tab.id);
                  if (tab.id !== "USER") {
                    setEtapaFilter("ALL");
                  }
                }}
                className={`h-9 px-4 text-xs font-bold rounded-xl transition cursor-pointer ${roleFilter === tab.id
                  ? "bg-white text-[#0E3E66] shadow-sm"
                  : "text-slate-500 hover:text-[#0E3E66]"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Listado de Usuarios (Tabla) */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            {roleFilter === "USER" ? (
              // Cabecera para Vista de Estudiantes
              <thead className="bg-slate-50 border-b border-slate-200/60 font-bold text-slate-600">
                <tr>
                  <th className="px-6 py-4">Estudiante</th>
                  <th className="px-6 py-4">Correo Electrónico</th>
                  <th className="px-6 py-4">Etapa de Enrolamiento</th>
                  <th className="px-6 py-4">Progreso SkillPaths</th>
                  <th className="px-6 py-4">Challenges Completados</th>
                  <th className="px-6 py-4 text-right">Acción / Rol</th>
                </tr>
              </thead>
            ) : (
              // Cabecera por defecto para Otros Roles
              <thead className="bg-slate-50 border-b border-slate-200/60 font-bold text-slate-600">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Correo Electrónico</th>
                  <th className="px-6 py-4">Fecha de Registro</th>
                  <th className="px-6 py-4">Rol Actual</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-slate-100 font-medium">
              {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((usuario) => {
                  const progress = studentProgress.find((p) => p.idUsuario === usuario.idUsuario);
                  const etapa = progress?.etapaEnrolamiento || "Sin Iniciar";
                  
                  // Colores del Badge de Etapa de Enrolamiento
                  let badgeClass = "bg-gray-50 text-gray-500 border-gray-200";
                  let dotClass = "bg-gray-400";
                  if (etapa === "Enrolamiento Completado") {
                    badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    dotClass = "bg-emerald-500";
                  } else if (etapa === "Entrevista Agendada") {
                    badgeClass = "bg-sky-50 text-sky-700 border-sky-200";
                    dotClass = "bg-sky-500";
                  } else if (etapa === "Test DISC Completado") {
                    badgeClass = "bg-violet-50 text-violet-700 border-violet-200";
                    dotClass = "bg-violet-500";
                  } else if (etapa === "Perfil Confirmado") {
                    badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
                    dotClass = "bg-amber-500";
                  } else if (etapa === "CV Cargado") {
                    badgeClass = "bg-pink-50 text-pink-700 border-pink-200";
                    dotClass = "bg-pink-500";
                  } else if (etapa === "Carga de CV") {
                    badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
                    dotClass = "bg-slate-400";
                  }

                  const spProgreso = progress?.progresoGeneralSkillPaths ?? 0;
                  const spIniciados = progress?.totalSkillPathsIniciados ?? 0;
                  const spCompletados = progress?.skillPathsCompletados ?? 0;
                  const chTotal = progress?.totalChallenges ?? 0;
                  const chCompletados = progress?.challengesCompletados ?? 0;

                  return (
                    <tr key={usuario.idUsuario} className="hover:bg-slate-50/40 transition">
                      {/* Columna Usuario / Estudiante */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {usuario.avatarUrl ? (
                            <img
                              src={usuario.avatarUrl}
                              alt={usuario.nombreCompleto}
                              className="h-9 w-9 rounded-full object-cover border border-slate-100"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-extrabold text-slate-600">
                              {getInitials(usuario.nombreCompleto)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-800">{usuario.nombreCompleto}</p>
                            {usuario.nuevoUsuario && (
                              <span className="inline-block mt-0.5 rounded px-1.5 py-0.2 text-[9px] font-bold bg-[#0E3E66]/10 text-[#0E3E66]">
                                Nuevo
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Columna Correo */}
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{usuario.correo}</td>

                      {roleFilter === "USER" ? (
                        // CELDAS EXCLUSIVAS PARA ESTUDIANTES
                        <>
                          {/* Columna Etapa de Enrolamiento */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border ${badgeClass}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
                              {etapa}
                            </span>
                          </td>

                          {/* Columna Progreso SkillPaths */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 w-40">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                                <span>{spProgreso}%</span>
                                {spIniciados > 0 && (
                                  <span className="text-slate-400 font-normal">
                                    {spCompletados}/{spIniciados} completados
                                  </span>
                                )}
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                                  style={{ width: `${spProgreso}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Columna Progreso Challenges */}
                          <td className="px-6 py-4">
                            {chTotal > 0 ? (
                              <div className="flex flex-col gap-1 w-40">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                                  <span>{Math.round((chCompletados / chTotal) * 100)}%</span>
                                  <span className="text-slate-400 font-normal">
                                    {chCompletados}/{chTotal} completados
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all duration-300"
                                    style={{ width: `${(chCompletados / chTotal) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">Sin iniciar challenges</span>
                            )}
                          </td>
                        </>
                      ) : (
                        // CELDAS GENERALES PARA OTROS ROLES
                        <>
                          {/* Columna Fecha Registro */}
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {usuario.fechaRegistro
                              ? new Date(usuario.fechaRegistro).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                              : "No registrada"}
                          </td>

                          {/* Columna Rol */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border ${usuario.rol === "ADMIN"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : usuario.rol === "MENTOR"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-purple-50 text-purple-700 border-purple-200"
                                }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${usuario.rol === "ADMIN"
                                  ? "bg-rose-500"
                                  : usuario.rol === "MENTOR"
                                    ? "bg-blue-500"
                                    : "bg-purple-500"
                                  }`}
                              />
                              {getRoleDisplayName(usuario.rol)}
                            </span>
                          </td>
                        </>
                      )}

                      {/* Columna Acción - Siempre Visible para permitir cambio de rol */}
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block w-40">
                          <select
                            value={usuario.rol}
                            onChange={(e) => handleRoleChangeInitiate(usuario, e.target.value)}
                            className="w-full h-9 rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-bold text-slate-600 outline-none appearance-none cursor-pointer hover:border-[#0E3E66] transition"
                          >
                            <option value="USER">Estudiante</option>
                            <option value="MENTOR">Path Mentor</option>
                            <option value="ADMIN">Administrador</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={roleFilter === "USER" ? 6 : 5} className="px-6 py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-500">No se encontraron usuarios</p>
                    <p className="text-xs text-slate-400 mt-1">Prueba a modificar los filtros o término de búsqueda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal/Diálogo de Confirmación */}
      {showConfirmModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <article className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 transform transition-all duration-300 scale-100 flex flex-col gap-4">
            {/* Header del Modal */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">¿Confirmar cambio de rol?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Estás a punto de modificar los privilegios de acceso para este usuario en el sistema.
                </p>
              </div>
            </div>

            {/* Detalles del Cambio */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {selectedUser.avatarUrl ? (
                  <img
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.nombreCompleto}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                    {getInitials(selectedUser.nombreCompleto)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-800 text-sm">{selectedUser.nombreCompleto}</p>
                  <p className="text-xs text-slate-500 font-mono">{selectedUser.correo}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/60 pt-3 text-xs font-bold">
                <div>
                  <span className="text-slate-400 block font-normal uppercase tracking-wider text-[9px]">Rol Anterior</span>
                  <span className="text-slate-600 text-xs">{getRoleDisplayName(selectedUser.rol)}</span>
                </div>
                <div className="text-slate-300">➜</div>
                <div className="text-right">
                  <span className="text-slate-400 block font-normal uppercase tracking-wider text-[9px]">Nuevo Rol</span>
                  <span className="text-[#0E3E66] text-xs">{getRoleDisplayName(targetRole)}</span>
                </div>
              </div>
            </div>

            {/* Sección de Error del Backend */}
            {updateError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 flex items-start gap-2.5">
                <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-rose-800">El servidor rechazó el cambio</p>
                  <p className="text-[11px] text-rose-600 mt-0.5 leading-relaxed">{updateError}</p>
                </div>
              </div>
            )}

            {/* Acciones del Modal */}
            <div className="flex justify-end gap-2.5 mt-2">
              <button
                type="button"
                disabled={updating}
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedUser(null);
                  setTargetRole("");
                  setUpdateError("");
                }}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 transition cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={handleRoleChangeConfirm}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0E3E66] hover:opacity-95 text-white text-xs font-bold px-5 transition shadow-md shadow-blue-100 cursor-pointer disabled:opacity-80 flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Confirmar cambio"
                )}
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
