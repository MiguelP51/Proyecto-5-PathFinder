"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { handleSecureLogout } from "@/lib/auth-utils";
import { Menu, X, LogOut, Sun, Moon } from "lucide-react";
import { useUserRole } from "@/hooks/use-role";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { data: session } = useSession();
  const userRole = useUserRole();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determinar la ruta del perfil según el rol
  const getProfileUrl = () => {
    const role = userRole?.toLowerCase();
  
    if (role === "admin") {
      return "";
    }
    
    // Si existe un rol, usa su nombre exacto en la URL; si no, usa el fallback
    return role ? `/${role}/profile` : "/profile";
  };

  const profileUrl = getProfileUrl();

  const linkClass = "font-semibold text-slate-600 hover:text-[#7447D7] dark:text-slate-300 dark:hover:text-white transition-colors duration-200";

  return (
    <>
      {/* NAVBAR */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
          
          {/* LEFT: Logo & Mobile Burger Menu */}
          <div className="flex items-center gap-3">
            {/* MENU BUTTON (Mobile only) */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 md:hidden"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>

            {/* LOGO */}
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/logo-pf.png"
                alt="PathFinder"
                width={120}
                height={40}
                className="h-auto w-auto dark:brightness-110"
                priority
              />
            </Link>
          </div>

          {/* RIGHT: Theme Toggle (Mobile) & Navigation */}
          <div className="flex items-center gap-6">
            
            {/* THEME TOGGLE (MOBILE ONLY) */}
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition hover:border-[#7447D7] hover:text-[#7447D7] dark:hover:border-purple-400 dark:hover:text-purple-400 cursor-pointer md:hidden"
                aria-label="Alternar modo oscuro"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}

            {/* DESKTOP MENU */}
            <nav className="hidden items-center gap-8 md:flex">
              <Link href="/" className={linkClass}>
                Inicio
              </Link>

              <Link href="/areas" className={linkClass}>
                Áreas
              </Link>

              <Link href="/about" className={linkClass}>
                Sobre nosotros
              </Link>

              <Link href="/contact" className={linkClass}>
                Contacto
              </Link>

              <Link href="/simulation" className={linkClass}>
                Simulación
              </Link>

              {!session ? (
                <Link
                  href="/login"
                  className="rounded-xl bg-gradient-to-r from-[#7447D7] to-[#D43EE6] px-5 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  Empieza ahora
                </Link>
              ) : (
                <>
                  {/* USER CARD */}
                  {profileUrl ? (
                    <Link
                      href={profileUrl}
                      className="flex items-center gap-3 rounded-full border border-slate-200 dark:border-slate-800 px-3 py-2 shadow-sm hover:border-[#7447D7] dark:hover:border-purple-400 transition"
                    >
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt="avatar"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white">
                          {session.user?.name?.charAt(0)}
                        </div>
                      )}

                      <div className="text-left">
                        <p className="text-sm font-semibold text-[#0E3E66] dark:text-slate-200">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {session.user?.email}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 rounded-full border border-slate-200 dark:border-slate-800 px-3 py-2 shadow-sm">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt="avatar"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white">
                          {session.user?.name?.charAt(0)}
                        </div>
                      )}

                      <div className="text-left">
                        <p className="text-sm font-semibold text-[#0E3E66] dark:text-slate-200">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* LOGOUT */}
                  <button
                    onClick={() =>
                      handleSecureLogout(session?.backendJwt)
                    }
                    className="rounded-full border border-slate-200 dark:border-slate-800 p-3 transition text-slate-600 dark:text-slate-300 hover:border-red-400 hover:text-red-500"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* THEME TOGGLE (DESKTOP) */}
              {mounted && (
                <button
                  type="button"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition hover:border-[#7447D7] hover:text-[#7447D7] dark:hover:border-purple-400 dark:hover:text-purple-400 cursor-pointer ml-2"
                  aria-label="Alternar modo oscuro"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* SIDEBAR OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-3">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="avatar"
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#A855F7] font-bold text-white">
                {session?.user?.name?.charAt(0) || "I"}
              </div>
            )}

            <div>
              <p className="font-semibold text-[#0E3E66] dark:text-slate-200">
                {session?.user?.name || "Invitado"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {session?.user?.email || ""}
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex flex-col gap-2 p-5">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Inicio
          </Link>

          {session && (
            <>
              {profileUrl && (
                <Link
                  href={profileUrl}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Mi Perfil
                </Link>
              )}

              {userRole?.toLowerCase() === "user" && (
                <Link
                  href="/user/app/simulation-intro"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Simulación
                </Link>
              )}

              <Link
                href="/areas"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Áreas
              </Link>

              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Sobre nosotros
              </Link>

              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Contacto
              </Link>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleSecureLogout(session?.backendJwt);
                }}
                className="mt-8 flex items-center gap-3 rounded-xl px-4 py-3 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
              >
                <LogOut className="h-5 w-5" />
                Cerrar sesión
              </button>
            </>
          )}

          {!session && (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl bg-gradient-to-r from-[#7447D7] to-[#D43EE6] px-4 py-3 text-center font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Empieza ahora
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}