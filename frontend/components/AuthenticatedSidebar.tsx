"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Home,
  User,
  ClipboardList,
  BarChart3,
  LayoutDashboard,
  CalendarDays,
  LogOut,
  X,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AuthenticatedSidebar({
  open,
  onClose,
}: Props) {
  const { data: session } = useSession();

  const image =
    session?.user?.image ||
    session?.user?.avatarUrl ||
    "";

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
        className={`fixed left-0 top-0 z-50 h-full w-72 transform bg-white shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5">

          <div className="flex items-center gap-3">

            {image ? (
              <img
                src={image}
                alt="avatar"
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#7447D7] to-[#D43EE6] text-white">
                U
              </div>
            )}

            <div>
              <p className="font-semibold text-[#0E3E66]">
                {session?.user?.name}
              </p>

              <p className="text-sm text-slate-500">
                {session?.user?.email}
              </p>
            </div>

          </div>

          <button onClick={onClose}>
            <X className="h-6 w-6" />
          </button>

        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-4">

          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-100"
          >
            <Home className="h-5 w-5" />
            Inicio
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-100"
          >
            <User className="h-5 w-5" />
            Mi Perfil
          </Link>

          <Link
            href="/app/simulation-intro"
            className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-100"
          >
            <ClipboardList className="h-5 w-5" />
            Simulación
          </Link>

          <Link
            href="/results"
            className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-100"
          >
            <BarChart3 className="h-5 w-5" />
            Resultados
          </Link>

          {session?.user?.rol === "MENTOR" && (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-100"
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>

              <Link
                href="/availability"
                className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-100"
              >
                <CalendarDays className="h-5 w-5" />
                Disponibilidad
              </Link>
            </>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-6 flex items-center gap-3 rounded-xl p-3 text-red-500 transition hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </button>

        </nav>
      </aside>
    </>
  );
}