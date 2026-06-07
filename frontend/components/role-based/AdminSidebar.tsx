"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Home,
  Users,
  Settings,
  Shield,
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
        className={`fixed left-0 top-0 z-50 flex flex-col bg-white dark:bg-slate-900 shadow-xl transition-transform duration-300
          w-full h-auto max-h-[85vh] border-b border-slate-200 dark:border-slate-800 rounded-b-3xl
          md:w-72 md:h-full md:max-h-full md:border-r md:border-b-0 md:rounded-b-none
          ${open 
            ? "translate-y-0 md:translate-x-0 md:translate-y-0" 
            : "-translate-y-full md:-translate-x-full md:translate-y-0"
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white">
                AD
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
            href="/admin/home"
            className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-100"
          >
            <Home className="h-5 w-5" />
            Dashboard
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-100"
          >
            <Users className="h-5 w-5" />
            Usuarios
          </Link>

          <Link
            href="/admin/mentors"
            className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-100"
          >
            <Shield className="h-5 w-5" />
            Path Mentors
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-100"
          >
            <Settings className="h-5 w-5" />
            Configuración
          </Link>

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
