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

export default function UsuariosPage() {
  const { data: session, status } = useSession();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

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
      const data = await apiFetch<Usuario[]>("/api/admin/users", {}, session?.backendJwt);
      setUsuarios(data);
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

    return matchesSearch && matchesRole;
  });

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
            Gestión de Usuarios y Accesos
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

        {/* Pestañas de Filtros de Rol */}
        <div className="flex flex-wrap gap-1 bg-slate-100/80 rounded-2xl p-1 shrink-0">
          {[
            { id: "ALL", label: "Todos" },
            { id: "ADMIN", label: "Administradores" },
            { id: "MENTOR", label: "Path Mentors" },
            { id: "USER", label: "Estudiantes" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`h-9 px-4 text-xs font-bold rounded-xl transition cursor-pointer ${roleFilter === tab.id
                  ? "bg-white text-[#0E3E66] shadow-sm"
                  : "text-slate-500 hover:text-[#0E3E66]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Listado de Usuarios (Tabla) */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/60 font-bold text-slate-600">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Correo Electrónico</th>
                <th className="px-6 py-4">Fecha de Registro</th>
                <th className="px-6 py-4">Rol Actual</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.idUsuario} className="hover:bg-slate-50/40 transition">
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
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{usuario.correo}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {usuario.fechaRegistro
                        ? new Date(usuario.fechaRegistro).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                        : "No registrada"}
                    </td>
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
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
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
