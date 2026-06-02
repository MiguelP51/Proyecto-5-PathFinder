"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  Target,
  Users,
  Home,
  Search,
  Info,
  Phone,
  Monitor,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Award,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  nivel?: number;
  xpActual?: number;
  xpSiguienteNivel?: number;
}

const miEspacio = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/user/app/exploracion/dashboard",
  },
  { label: "Explorar", icon: Compass, href: "/user/app/exploracion/explorar" },
  { label: "SkillPaths", icon: BookOpen, href: "/user/app/skillpaths" },
  { label: "Challenges", icon: Target, href: "/user/app/challenges" },
  { label: "Entrevistas", icon: Users, href: "/user/app/entrevistas" },
];

const explorar = [
  { label: "Inicio", icon: Home, href: "/" },
  { label: "Áreas", icon: Search, href: "/areas" },
  { label: "Sobre nosotros", icon: Info, href: "/about" },
  { label: "Contacto", icon: Phone, href: "/contact" },
  { label: "Simulación", icon: Monitor, href: "/simulation" },
];

export default function UserSidebar({
  open,
  onClose,
  nivel = 1,
  xpActual = 0,
  xpSiguienteNivel = 1000,
}: Props) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const nombre = session?.user?.name ?? "Estudiante";
  const email = session?.user?.email ?? "";
  const avatar =
    session?.user?.image ??
    (session?.user as { avatarUrl?: string })?.avatarUrl ??
    "";
  const xpPct = Math.min(Math.round((xpActual / xpSiguienteNivel) * 100), 100);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ── Logo ── */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <Link href="/" onClick={onClose} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7447D7] to-[#D43EE6] shadow-md shadow-purple-200">
              <Target className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-base font-extrabold leading-none tracking-tight text-[#7447D7]">
                PathFinder
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Tu camino al éxito
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Usuario ── */}
        <div className="flex-shrink-0 border-b border-slate-100 px-4 py-4">
          <div className="flex items-center gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt="avatar"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-200"
              />
            ) : (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7447D7] to-[#D43EE6] text-sm font-bold text-white shadow-sm">
                {nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {nombre}
              </p>
              <p className="truncate text-xs text-slate-400">{email}</p>
            </div>
          </div>

          {/* Barra XP */}
          <div className="mt-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-xs font-bold text-yellow-600">
                  Nivel {nivel}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {xpActual} / {xpSiguienteNivel} XP
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-[#7447D7] to-[#D43EE6] transition-all duration-500"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Navegación scrollable ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Mi Espacio
          </p>
          {miEspacio.map(({ label, icon: Icon, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-[#7447D7] to-[#D43EE6] text-white shadow-sm shadow-purple-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}

          <p className="mb-2 mt-5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Explorar
          </p>
          {explorar.map(({ label, icon: Icon, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Footer SIEMPRE VISIBLE ── */}
        <div className="flex-shrink-0 border-t border-slate-100 px-3 py-3">
          <Link
            href="/user/configuracion"
            onClick={onClose}
            className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            Configuración
          </Link>
          <Link
            href="/ayuda"
            onClick={onClose}
            className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <HelpCircle className="h-4 w-4 flex-shrink-0" />
            Ayuda
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
