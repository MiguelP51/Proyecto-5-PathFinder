"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: session } = useSession();

  return (
    <>
      {/* NAVBAR */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">

          {/* LEFT */}
          <div className="flex items-center gap-3">

            {/* MENU BUTTON */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 transition hover:bg-slate-100"
            >
              {mobileOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>

            {/* LOGO */}
            <Link href="/">
              <Image
                src="/assets/logo-pf.png"
                alt="PathFinder"
                width={120}
                height={40}
                className="h-auto w-auto"
                priority
              />
            </Link>

          </div>

          {/* DESKTOP MENU */}
          <nav className="hidden items-center gap-8 md:flex">

            <Link href="/">
              Inicio
            </Link>

            <Link href="/areas">
              Áreas
            </Link>

            <Link href="/about">
              Sobre nosotros
            </Link>

            <Link href="/contact">
              Contacto
            </Link>

            <Link href="/app/simulation-intro">
              Simulación
            </Link>

            {!session ? (
              <>
                <Link
                  href="/login"
                  className="font-medium"
                >
                  Iniciar sesión
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#A855F7] px-5 py-3 font-semibold text-white"
                >
                  Empieza ahora
                </Link>
              </>
            ) : (
              <>
                {/* USER */}
                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-full border border-slate-200 px-3 py-2 shadow-sm"
                >

                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="avatar"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#A855F7] font-bold text-white">
                      {session.user?.name?.charAt(0)}
                    </div>
                  )}

                  <div className="text-left">
                    <p className="text-sm font-semibold text-[#0E3E66]">
                      {session.user?.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {session.user?.email}
                    </p>
                  </div>

                </Link>

                {/* LOGOUT */}
                <button
                  onClick={() =>
                    signOut({
                      callbackUrl: "/",
                    })
                  }
                  className="rounded-full border border-slate-200 p-3 transition hover:border-red-400 hover:text-red-500"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}

          </nav>

        </div>
      </header>

      {/* SIDEBAR OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5">

          <div className="flex items-center gap-3">

            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="avatar"
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#A855F7] font-bold text-white">
                {session?.user?.name?.charAt(0)}
              </div>
            )}

            <div>
              <p className="font-semibold text-[#0E3E66]">
                {session?.user?.name || "Invitado"}
              </p>

              <p className="text-sm text-slate-500">
                {session?.user?.email || ""}
              </p>
            </div>

          </div>

          <button
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-7 w-7" />
          </button>

        </div>

        {/* MENU */}
        <nav className="flex flex-col gap-2 p-5">

          <Link
            href="/"
            className="rounded-xl px-4 py-3 transition hover:bg-slate-100"
          >
            Inicio
          </Link>

          {session && (
            <>
              <Link
                href="/profile"
                className="rounded-xl px-4 py-3 transition hover:bg-slate-100"
              >
                Mi Perfil
              </Link>

              <Link
                href="/app/simulation-intro"
                className="rounded-xl px-4 py-3 transition hover:bg-slate-100"
              >
                Simulación
              </Link>

              <Link
                href="/areas"
                className="rounded-xl px-4 py-3 transition hover:bg-slate-100"
              >
                Áreas
              </Link>

              <Link
                href="/about"
                className="rounded-xl px-4 py-3 transition hover:bg-slate-100"
              >
                Sobre nosotros
              </Link>

              <Link
                href="/contact"
                className="rounded-xl px-4 py-3 transition hover:bg-slate-100"
              >
                Contacto
              </Link>

              <button
                onClick={() =>
                  signOut({
                    callbackUrl: "/",
                  })
                }
                className="mt-8 flex items-center gap-3 rounded-xl px-4 py-3 text-left text-red-500 transition hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                Cerrar sesión
              </button>
            </>
          )}

          {!session && (
            <>
              <Link
                href="/login"
                className="rounded-xl px-4 py-3 transition hover:bg-slate-100"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#A855F7] px-4 py-3 text-center font-semibold text-white"
              >
                Empieza ahora
              </Link>
            </>
          )}

        </nav>

      </aside>
    </>
  );
}