"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

interface Props {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

function getInitials(
  name?: string | null,
  email?: string | null
) {
  const source =
    name?.trim() ||
    email?.split("@")[0] ||
    "Admin";

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AdminTopBar({
  onMenuClick,
  sidebarOpen,
}: Props) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const name =
    session?.user?.name ||
    "Admin conectado";

  const email =
    session?.user?.email || "";

  const image =
    session?.user?.image ||
    session?.user?.avatarUrl ||
    "";

  return (
    <header className={`sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur text-slate-900 dark:text-slate-100 transition-all duration-300 ${
      sidebarOpen ? "md:pl-72" : "md:pl-0"
    }`}>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          {/* MENU BUTTON */}
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-red-600 hover:text-red-600"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* LOGO */}
          <Link href="/admin/home">
            <Image
              src="/assets/logo-pf.png"
              alt="PathFinder"
              width={118}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

        </div>

        {/* RIGHT */}
        <div className="flex min-w-0 items-center gap-3">

          {/* SESION */}
          <span className="hidden rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 sm:inline-flex">
            Administrador
          </span>

          {/* THEME TOGGLE */}
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-red-600 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-400 dark:hover:text-red-400 cursor-pointer"
              aria-label="Alternar modo oscuro"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          {/* USER */}
          <div className="flex min-w-0 items-center gap-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-2 py-1 shadow-sm">

            {image ? (
              <img
                src={image}
                alt={name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-sm font-bold text-white">
                {getInitials(name, email)}
              </div>
            )}

            {/* INFO */}
            <div className="hidden min-w-0 pr-2 text-sm md:block">
              <p className="truncate font-semibold text-[#0E3E66] dark:text-slate-200">
                {name}
              </p>

              <p className="truncate text-xs text-slate-500">
                {email}
              </p>
            </div>

          </div>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={() =>
              signOut({
                callbackUrl: "/",
              })
            }
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-red-600 hover:text-red-600"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>

        </div>
      </div>
    </header>
  );
}
