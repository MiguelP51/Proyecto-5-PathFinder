"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Layers,
  ChevronLeft,
  Award,
  LayoutDashboard,
  Compass,
  BookOpen,
  Trophy,
  Calendar,
  Home,
  Map,
  Info,
  Mail,
  Target,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UserSidebar({ open, onClose }: Props) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const image =
    session?.user?.image ||
    session?.user?.avatarUrl ||
    "";

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href || pathname === "/home";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const linkClass = (href: string) => {
    const active = isActive(href);
    return `flex items-center gap-3 rounded-xl p-3 text-sm font-semibold transition-all duration-200 ${
      active
        ? "bg-gradient-to-r from-[#7447D7] to-[#D43EE6] text-white shadow-lg shadow-purple-200/50"
        : "text-slate-600 hover:bg-slate-50 hover:text-[#7447D7]"
    }`;
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-slate-100 bg-white shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header - Logo */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7447D7] to-[#D43EE6] text-white shadow-md shadow-purple-200">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-black tracking-wide text-slate-800 text-lg">
              PATHFINDER
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* User Card & Level XP */}
        <div className="px-6 pb-4 space-y-4">
          {/* User Profile */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-50 bg-slate-50/50 p-3">
            {image ? (
              <img
                src={image}
                alt="avatar"
                className="h-11 w-11 rounded-full object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#7447D7] to-[#D43EE6] font-bold text-white text-sm">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800">
                {session?.user?.name || "Estudiante"}
              </p>
              <p className="truncate text-xs text-slate-400">
                {session?.user?.email || "usuario@pathfinder.com"}
              </p>
            </div>
          </div>

          {/* Level Progress (XP Card) */}
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-3 flex items-center justify-between text-xs font-bold text-amber-800 shadow-sm shadow-amber-100/20">
            <div className="flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-amber-600" />
              <span>Nivel 5</span>
            </div>
            <span className="text-amber-600/90">2450/3000 XP</span>
          </div>
        </div>

        {/* Scrollable Links Container */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {/* Section: MI ESPACIO */}
          <div className="space-y-1.5">
            <p className="px-3 text-[11px] font-black tracking-wider text-slate-400 uppercase">
              Mi espacio
            </p>
            <Link href="/user/home" className={linkClass("/user/home")} onClick={onClose}>
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/user/explore" className={linkClass("/user/explore")} onClick={onClose}>
              <Compass className="h-5 w-5" />
              <span>Explorar</span>
            </Link>
            <Link href="/user/skillpaths" className={linkClass("/user/skillpaths")} onClick={onClose}>
              <BookOpen className="h-5 w-5" />
              <span>SkillPaths</span>
            </Link>
            <Link href="/user/challenges" className={linkClass("/user/challenges")} onClick={onClose}>
              <Trophy className="h-5 w-5" />
              <span>Challenges</span>
            </Link>
            <Link href="/user/interviews" className={linkClass("/user/interviews")} onClick={onClose}>
              <Calendar className="h-5 w-5" />
              <span>Entrevistas</span>
            </Link>
          </div>

          {/* Section: EXPLORAR */}
          <div className="space-y-1.5">
            <p className="px-3 text-[11px] font-black tracking-wider text-slate-400 uppercase">
              Explorar
            </p>
            <Link href="/" className={linkClass("/")} onClick={onClose}>
              <Home className="h-5 w-5" />
              <span>Inicio</span>
            </Link>
            <Link href="/areas" className={linkClass("/areas")} onClick={onClose}>
              <Map className="h-5 w-5" />
              <span>Áreas</span>
            </Link>
            <Link href="/about" className={linkClass("/about")} onClick={onClose}>
              <Info className="h-5 w-5" />
              <span>Sobre nosotros</span>
            </Link>
            <Link href="/contact" className={linkClass("/contact")} onClick={onClose}>
              <Mail className="h-5 w-5" />
              <span>Contacto</span>
            </Link>
            <Link href="/simulation" className={linkClass("/simulation")} onClick={onClose}>
              <Target className="h-5 w-5" />
              <span>Simulación</span>
            </Link>
          </div>
        </div>

        {/* Footer items */}
        <div className="border-t border-slate-100 p-4 space-y-1">
          <Link
            href="/user/profile"
            className="flex items-center gap-3 rounded-xl p-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-[#7447D7]"
            onClick={onClose}
          >
            <Settings className="h-5 w-5 text-slate-400" />
            <span>Profile</span>
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-3 rounded-xl p-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-[#7447D7]"
            onClick={onClose}
          >
            <HelpCircle className="h-5 w-5 text-slate-400" />
            <span>Ayuda</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl p-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
