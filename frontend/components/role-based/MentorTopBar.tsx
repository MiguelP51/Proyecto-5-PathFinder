"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import NotificationBell from "./NotificationBell";

interface Props {
  onMenuClick: () => void;
}

export default function MentorTopBar({ onMenuClick }: Props) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const name = session?.user?.name || "Mentor";
  const userImage = session?.user?.image || session?.user?.avatarUrl || "";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* LEFT SECTION: Burger + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition hover:border-[#7447D7] hover:text-[#7447D7] dark:hover:border-purple-400 dark:hover:text-purple-400 cursor-pointer"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* LOGO */}
          <Link href="/mentor/home">
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

        {/* RIGHT SECTION: Theme + Notifications + Profile */}
        <div className="flex min-w-0 items-center gap-3">
          {/* THEME TOGGLE */}
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex h-10 px-3 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#7447D7] hover:text-[#7447D7] dark:border-slate-700 dark:text-slate-300 dark:hover:border-purple-400 dark:hover:text-purple-400 cursor-pointer gap-1.5"
              aria-label="Alternar modo oscuro"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-5 w-5" />
                  <span className="text-xs font-semibold">Modo claro</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  <span className="text-xs font-semibold">Modo oscuro</span>
                </>
              )}
            </button>
          )}

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Card Link to Profile */}
          <Link
            href="/mentor/profile"
            className="flex min-w-0 items-center gap-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-2 py-1 shadow-sm hover:border-[#7447D7] dark:hover:border-purple-400 transition cursor-pointer"
          >
            {userImage ? (
              <img
                src={userImage}
                alt={name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7447D7] to-[#D43EE6] text-sm font-bold text-white">
                {name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* INFO */}
            <div className="hidden min-w-0 pr-2 text-sm md:block">
              <p className="truncate font-semibold text-[#0E3E66] dark:text-slate-200">
                {name}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                PathMentor
              </p>
            </div>
          </Link>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={() =>
              signOut({
                callbackUrl: "/",
              })
            }
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition hover:border-[#7447D7] hover:text-[#7447D7] dark:hover:border-purple-400 dark:hover:text-purple-400 cursor-pointer"
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

