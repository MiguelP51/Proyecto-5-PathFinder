"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart2,
  Users,
  Shield,
  UploadCloud,
  Grid,
  BookOpen,
  Target,
  RefreshCw,
  FileText,
  LogOut,
  X,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({
  open,
  onClose,
}: Props) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const image =
    session?.user?.image ||
    session?.user?.avatarUrl ||
    "";

  // Helper para determinar si un enlace está activo
  const isActive = (path: string) => pathname === path;

  // Clase para los enlaces
  const linkClass = (path: string) =>
    `flex items-center gap-3 rounded-xl p-3 transition text-sm font-medium ${
      isActive(path)
        ? "bg-[#0E3E66]/10 text-[#0E3E66]"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex flex-col bg-white dark:bg-slate-900 shadow-xl transition-transform duration-300
          w-full h-auto max-h-[85vh] border-b border-slate-200 dark:border-slate-800 rounded-b-3xl overflow-y-auto
          md:w-72 md:h-full md:max-h-full md:border-r md:border-b-0 md:rounded-b-none scrollbar-thin scrollbar-thumb-slate-200
          ${open 
            ? "translate-y-0 md:translate-x-0 md:translate-y-0" 
            : "-translate-y-full md:-translate-x-full md:translate-y-0"
          }`}
      >

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 shrink-0 sticky top-0 bg-white z-10">

          <div className="flex items-center gap-3">

            {image ? (
              <img
                src={image}
                alt="avatar"
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#0E3E66] to-blue-800 text-white font-bold">
                AD
              </div>
            )}

            <div>
              <p className="font-semibold text-[#0E3E66] text-sm">
                {session?.user?.name || "Administrador"}
              </p>

              <p className="text-xs text-slate-500 max-w-[140px] truncate">
                {session?.user?.email || "admin@pathfinder.com"}
              </p>
            </div>

          </div>

          <button onClick={onClose} className="md:hidden">
            <X className="h-6 w-6 text-slate-500" />
          </button>

        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-6 p-4">

          {/* GENERAL */}
          <div>
            <p className="px-3 mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">General</p>
            <div className="flex flex-col gap-1">
              <Link href="/admin/dashboard" className={linkClass("/admin/dashboard")}>
                <Home className="h-5 w-5" />
                Dashboard
              </Link>
            </div>
          </div>

          {/* GESTIÓN DE USUARIOS */}
          <div>
            <p className="px-3 mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">Gestión de Usuarios</p>
            <div className="flex flex-col gap-1">
              <Link href="/admin/home" className={linkClass("/admin/home")}>
                <Users className="h-5 w-5" />
                Usuarios
              </Link>
              <Link href="/admin/roles" className={linkClass("/admin/roles")}>
                <Shield className="h-5 w-5" />
                Roles y Permisos
              </Link>
            </div>
          </div>

          {/* CONTENIDO */}
          <div>
            <p className="px-3 mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">Contenido</p>
            <div className="flex flex-col gap-1">
              <Link href="/admin/areas" className={linkClass("/admin/areas")}>
                <Grid className="h-5 w-5" />
                Áreas y Subáreas
              </Link>
              <Link href="/admin/skillpaths" className={linkClass("/admin/skillpaths")}>
                <BookOpen className="h-5 w-5" />
                SkillPaths
              </Link>
              <Link href="/admin/pathchallenges" className={linkClass("/admin/pathchallenges")}>
                <Target className="h-5 w-5" />
                PathChallenges
              </Link>
            </div>
          </div>

          {/* INTEGRACIÓN Y DATOS */}
          <div>
            <p className="px-3 mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">Integración y Datos</p>
            <div className="flex flex-col gap-1">
              <Link href="/admin/sincronizacion" className={linkClass("/admin/sincronizacion")}>
                <RefreshCw className="h-5 w-5" />
                Sincronización de catálogo de cursos
              </Link>
              <Link href="/admin/audit-logs" className={linkClass("/admin/audit-logs")}>
                <FileText className="h-5 w-5" />
                Auditoría y Logs
              </Link>
            </div>
          </div>

          <div className="mt-2 border-t border-slate-100 pt-4">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Cerrar sesión
            </button>
          </div>

        </nav>
      </aside>
    </>
  );
}
